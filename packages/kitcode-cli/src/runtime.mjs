import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import {addVibeEqualsOnce, countHeadEqualsOnce, loadEqualsLedger} from './equals-ledger.mjs';
import {
  countCommits,
  createFolderProjectId,
  createProjectId,
  getGitSignature,
  tryDetectRepoRoot,
} from './git.mjs';
import {loadState, saveState} from './store.mjs';
import {createVibeSnapshot, scanVibeChanges} from './vibe.mjs';
import {
  buildRewardSummary,
  configureRewardSettings,
  DEFAULT_REWARD_EQUALS,
  DEFAULT_REWARD_SECONDS,
} from './reward.mjs';

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 4747;
export {DEFAULT_REWARD_EQUALS, DEFAULT_REWARD_SECONDS};

const IDLE_AFTER_MS = 5 * 60 * 1000;
const SYNC_INTERVAL_MS = 2000;
const SAVE_INTERVAL_MS = 10000;
const GIT_INTERVAL_MS = 15000;
const VIBE_INTERVAL_MS = 5000;

function normalizeProject(project) {
  const sourceType = project.sourceType === 'vibe' ? 'vibe' : 'git';

  return {
    id: project.id,
    repoRoot: project.repoRoot,
    sourceType,
    active: project.active !== false,
    activeSeconds: Number(project.activeSeconds) || 0,
    idleSeconds: Number(project.idleSeconds) || 0,
    commitCount: Number(project.commitCount) || 0,
    changeBatchCount: Number(project.changeBatchCount) || 0,
    lastActiveAt: project.lastActiveAt ?? new Date().toISOString(),
    vibeSnapshot: sourceType === 'vibe' && project.vibeSnapshot && typeof project.vibeSnapshot === 'object'
      ? project.vibeSnapshot
      : {files: {}},
  };
}

function normalizeState(state) {
  const projects = {};

  for (const [id, project] of Object.entries(state.projects ?? {})) {
    projects[id] = normalizeProject({id, ...project});
  }

  return {
    version: 4,
    projects,
  };
}

function detectProject(targetPath = '.') {
  const absolutePath = path.resolve(process.cwd(), targetPath);
  const gitRoot = tryDetectRepoRoot(absolutePath);

  if (gitRoot) {
    return {
      id: createProjectId(gitRoot),
      root: gitRoot,
      sourceType: 'git',
    };
  }

  return {
    id: createFolderProjectId(absolutePath),
    root: absolutePath,
    sourceType: 'vibe',
  };
}

function createProjectRecord(detectedProject, existing = {}) {
  const now = new Date().toISOString();

  return normalizeProject({
    id: detectedProject.id,
    repoRoot: detectedProject.root,
    sourceType: detectedProject.sourceType,
    active: true,
    activeSeconds: existing.activeSeconds ?? 0,
    idleSeconds: existing.idleSeconds ?? 0,
    commitCount: existing.commitCount ?? 0,
    changeBatchCount: existing.changeBatchCount ?? 0,
    lastActiveAt: existing.lastActiveAt ?? now,
    vibeSnapshot: existing.vibeSnapshot ?? (
      detectedProject.sourceType === 'vibe' ? createVibeSnapshot(detectedProject.root) : {files: {}}
    ),
  });
}

function projectTotals(state) {
  const projects = Object.values(normalizeState(state).projects);

  return {
    totalProjects: projects.length,
    trackingProjects: projects.filter((project) => project.active).length,
  };
}

function pathContains(parent, child) {
  const relative = path.relative(parent, child);

  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function findProjectIdForPath(state, targetPath = '.') {
  if (state.projects[targetPath]) {
    return targetPath;
  }

  const detectedProject = detectProject(targetPath);

  if (state.projects[detectedProject.id]) {
    return detectedProject.id;
  }

  const absolutePath = path.resolve(process.cwd(), targetPath);
  const candidates = Object.values(state.projects)
    .filter((project) => project.sourceType === 'vibe' && pathContains(project.repoRoot, absolutePath))
    .sort((a, b) => b.repoRoot.length - a.repoRoot.length);

  return candidates[0]?.id ?? detectedProject.id;
}

export function createRuntime(options) {
  const rewardSettings = configureRewardSettings(options);

  return {
    options: {
      ...options,
      rewardSeconds: rewardSettings.requiredSeconds,
      rewardEquals: rewardSettings.requiredEquals,
    },
    state: normalizeState(loadState()),
    projectRuns: new Map(),
  };
}

export function registerProject(targetPath = '.') {
  const detectedProject = detectProject(targetPath);
  const state = normalizeState(loadState());
  const existingProject = state.projects[detectedProject.id];
  const project = createProjectRecord(detectedProject, state.projects[detectedProject.id]);

  if (existingProject || project.sourceType === 'git') {
    refreshProject(project);
  }

  project.active = true;
  state.projects[project.id] = project;
  saveState(state);

  return projectTotals(state);
}

export function listProjects() {
  const state = normalizeState(loadState());
  saveState(state);

  return projectTotals(state);
}

export function removeProject(targetPathOrProjectId = '.') {
  const state = normalizeState(loadState());
  const projectId = findProjectIdForPath(state, targetPathOrProjectId);

  const project = state.projects[projectId];

  if (!project) {
    return null;
  }

  delete state.projects[projectId];
  saveState(state);

  return projectTotals(state);
}

export function setAllProjectsActive(active) {
  const state = normalizeState(loadState());

  for (const project of Object.values(state.projects)) {
    project.active = active;
  }

  saveState(state);

  return projectTotals(state);
}

export function setProjectActiveByPath(targetPath = '.', active = true) {
  const state = normalizeState(loadState());
  const projectId = findProjectIdForPath(state, targetPath);
  const project = state.projects[projectId];

  if (!project) {
    return null;
  }

  project.active = active;
  saveState(state);

  return projectTotals(state);
}

export function refreshProject(project) {
  if (project.sourceType === 'vibe') {
    const result = scanVibeChanges(project.repoRoot, project.vibeSnapshot);

    project.vibeSnapshot = result.snapshot;

    if (result.equalsAdded > 0) {
      const batchId = crypto.randomUUID();
      addVibeEqualsOnce(project.repoRoot, batchId, result.equalsAdded);
      project.changeBatchCount += 1;
    }

    project.lastActiveAt = new Date().toISOString();
    return result.changedFiles > 0;
  } else {
    project.commitCount = countCommits(project.repoRoot);
    countHeadEqualsOnce(project.repoRoot);
  }

  project.lastActiveAt = new Date().toISOString();
  return true;
}

function touchProject(project, run) {
  run.lastActivityAt = Date.now();
  project.lastActiveAt = new Date().toISOString();
}

function tickProject(project, run) {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - run.lastTick) / 1000);

  if (now - run.lastActivityAt > IDLE_AFTER_MS) {
    project.idleSeconds += elapsedSeconds;
  } else {
    project.activeSeconds += elapsedSeconds;
  }

  run.lastTick = now;
}

function tickActiveProjects(runtime) {
  for (const [projectId, run] of runtime.projectRuns.entries()) {
    const project = runtime.state.projects[projectId];

    if (project) {
      tickProject(project, run);
    }
  }
}

function startProject(runtime, project) {
  if (runtime.projectRuns.has(project.id)) {
    return;
  }

  const run = {
    lastTick: Date.now(),
    lastActivityAt: Date.now(),
    lastGitSignature: project.sourceType === 'git' ? getGitSignature(project.repoRoot) : '',
    watcher: undefined,
  };

  refreshProject(project);

  try {
    run.watcher = fs.watch(project.repoRoot, {recursive: true}, (_eventType, fileName) => {
      const normalized = String(fileName ?? '');
      const currentProject = runtime.state.projects[project.id];

      if (
        !currentProject ||
        normalized.startsWith('.git') ||
        normalized.startsWith('node_modules') ||
        normalized.startsWith('dist')
      ) {
        return;
      }

      if (currentProject.sourceType === 'vibe') {
        if (refreshProject(currentProject)) {
          touchProject(currentProject, run);
        }
        return;
      }

      touchProject(currentProject, run);
    });
  } catch {
    run.watcher = undefined;
  }

  runtime.projectRuns.set(project.id, run);
}

function stopProject(runtime, projectId) {
  const run = runtime.projectRuns.get(projectId);
  const project = runtime.state.projects[projectId];

  if (!run) {
    return;
  }

  if (project) {
    tickProject(project, run);
  }

  run.watcher?.close();
  runtime.projectRuns.delete(projectId);
}

function reconcileProjects(runtime) {
  tickActiveProjects(runtime);

  const diskState = normalizeState(loadState());

  for (const [projectId, project] of Object.entries(runtime.state.projects)) {
    if (!diskState.projects[projectId]) {
      stopProject(runtime, projectId);
      continue;
    }

    diskState.projects[projectId] = {
      ...diskState.projects[projectId],
      activeSeconds: project.activeSeconds,
      idleSeconds: project.idleSeconds,
      commitCount: project.commitCount,
      changeBatchCount: project.changeBatchCount,
      lastActiveAt: project.lastActiveAt,
      vibeSnapshot: project.vibeSnapshot,
    };
  }

  runtime.state = diskState;

  for (const project of Object.values(runtime.state.projects)) {
    if (project.active) {
      startProject(runtime, project);
    } else {
      stopProject(runtime, project.id);
    }
  }
}

export function buildSummary(runtime) {
  const projects = Object.values(runtime.state.projects);
  const trackingProjects = projects.filter((project) => project.active);
  const totalActiveSeconds = projects.reduce((sum, project) => sum + project.activeSeconds, 0);
  const totalIdleSeconds = projects.reduce((sum, project) => sum + project.idleSeconds, 0);
  const totalCommits = projects.reduce((sum, project) => sum + project.commitCount, 0);
  const totalChangeBatches = projects.reduce((sum, project) => sum + project.changeBatchCount, 0);
  const earnedSeconds = totalActiveSeconds;
  const ledger = loadEqualsLedger();
  const totalEquals = ledger.total_equals;
  const reward = buildRewardSummary({
    earnedSeconds,
    totalEquals,
    settings: {
      requiredSeconds: runtime.options.rewardSeconds,
      requiredEquals: runtime.options.rewardEquals ?? DEFAULT_REWARD_EQUALS,
    },
    ledger,
  });

  return {
    connected: true,
    global: {
      totalActiveSeconds: Math.floor(totalActiveSeconds),
      totalIdleSeconds: Math.floor(totalIdleSeconds),
      totalCommits,
      totalProjects: projects.length,
      trackingProjects: trackingProjects.length,
      totalEquals,
      totalChangeBatches,
      sourceModes: {
        git: trackingProjects.some((project) => project.sourceType === 'git'),
        vibe: trackingProjects.some((project) => project.sourceType === 'vibe'),
      },
    },
    reward,
  };
}

export function startWatchers(runtime) {
  reconcileProjects(runtime);

  const syncTimer = setInterval(() => reconcileProjects(runtime), SYNC_INTERVAL_MS);
  const saveTimer = setInterval(() => {
    tickActiveProjects(runtime);
    saveState(runtime.state);
  }, SAVE_INTERVAL_MS);
  const gitTimer = setInterval(() => {
    for (const [projectId, run] of runtime.projectRuns.entries()) {
      const project = runtime.state.projects[projectId];

      if (!project) {
        continue;
      }

      if (project.sourceType === 'vibe') {
        continue;
      }

      const signature = getGitSignature(project.repoRoot);

      if (signature !== run.lastGitSignature) {
        run.lastGitSignature = signature;
        touchProject(project, run);
        refreshProject(project);
      }
    }
  }, GIT_INTERVAL_MS);
  const vibeTimer = setInterval(() => {
    for (const [projectId, run] of runtime.projectRuns.entries()) {
      const project = runtime.state.projects[projectId];

      if (!project || project.sourceType !== 'vibe') {
        continue;
      }

      if (refreshProject(project)) {
        touchProject(project, run);
      }
    }
  }, VIBE_INTERVAL_MS);

  return () => {
    clearInterval(syncTimer);
    clearInterval(saveTimer);
    clearInterval(gitTimer);
    clearInterval(vibeTimer);
    tickActiveProjects(runtime);

    for (const projectId of runtime.projectRuns.keys()) {
      stopProject(runtime, projectId);
    }

    saveState(runtime.state);
  };
}
