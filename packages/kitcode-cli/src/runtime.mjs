import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {countHeadEqualsOnce, getTotalEquals} from './equals-ledger.mjs';
import {countCommits, createProjectId, detectRepoRoot, getGitSignature} from './git.mjs';
import {loadState, saveState} from './store.mjs';

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 4747;
export const DEFAULT_REWARD_SECONDS = 7200;

const IDLE_AFTER_MS = 5 * 60 * 1000;
const SYNC_INTERVAL_MS = 2000;
const SAVE_INTERVAL_MS = 10000;
const GIT_INTERVAL_MS = 15000;

function normalizeProject(project) {
  return {
    id: project.id,
    repoRoot: project.repoRoot,
    active: project.active !== false,
    activeSeconds: Number(project.activeSeconds) || 0,
    idleSeconds: Number(project.idleSeconds) || 0,
    commitCount: Number(project.commitCount) || 0,
    lastActiveAt: project.lastActiveAt ?? new Date().toISOString(),
  };
}

function normalizeState(state) {
  const projects = {};

  for (const [id, project] of Object.entries(state.projects ?? {})) {
    projects[id] = normalizeProject({id, ...project});
  }

  return {
    version: 3,
    projects,
  };
}

function createProjectRecord(repoRoot, existing = {}) {
  const id = createProjectId(repoRoot);
  const now = new Date().toISOString();

  return normalizeProject({
    id,
    repoRoot,
    active: true,
    activeSeconds: existing.activeSeconds ?? 0,
    idleSeconds: existing.idleSeconds ?? 0,
    commitCount: existing.commitCount ?? 0,
    lastActiveAt: existing.lastActiveAt ?? now,
  });
}

function projectTotals(state) {
  const projects = Object.values(normalizeState(state).projects);

  return {
    totalProjects: projects.length,
    trackingProjects: projects.filter((project) => project.active).length,
  };
}

export function createRuntime(options) {
  return {
    options,
    state: normalizeState(loadState()),
    projectRuns: new Map(),
  };
}

export function registerProject(targetPath = '.') {
  const repoRoot = detectRepoRoot(path.resolve(process.cwd(), targetPath));
  const state = normalizeState(loadState());
  const project = createProjectRecord(repoRoot, state.projects[createProjectId(repoRoot)]);

  refreshProject(project);
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
  let projectId = targetPathOrProjectId;

  try {
    const repoRoot = detectRepoRoot(path.resolve(process.cwd(), targetPathOrProjectId));
    projectId = createProjectId(repoRoot);
  } catch {
    projectId = targetPathOrProjectId;
  }

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

export function refreshProject(project) {
  project.commitCount = countCommits(project.repoRoot);
  countHeadEqualsOnce(project.repoRoot);
  project.lastActiveAt = new Date().toISOString();
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
    lastGitSignature: getGitSignature(project.repoRoot),
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
      lastActiveAt: project.lastActiveAt,
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
  const requiredSeconds = Math.max(1, runtime.options.rewardSeconds);
  const earnedSeconds = totalActiveSeconds;

  return {
    connected: true,
    global: {
      totalActiveSeconds: Math.floor(totalActiveSeconds),
      totalIdleSeconds: Math.floor(totalIdleSeconds),
      totalCommits,
      totalProjects: projects.length,
      trackingProjects: trackingProjects.length,
      totalEquals: getTotalEquals(),
    },
    reward: {
      requiredSeconds,
      earnedSeconds: Math.floor(earnedSeconds),
      timeLeftSeconds: Math.max(0, requiredSeconds - earnedSeconds),
      progress: Math.min(1, earnedSeconds / requiredSeconds),
    },
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

      const signature = getGitSignature(project.repoRoot);

      if (signature !== run.lastGitSignature) {
        run.lastGitSignature = signature;
        touchProject(project, run);
        refreshProject(project);
      }
    }
  }, GIT_INTERVAL_MS);

  return () => {
    clearInterval(syncTimer);
    clearInterval(saveTimer);
    clearInterval(gitTimer);
    tickActiveProjects(runtime);

    for (const projectId of runtime.projectRuns.keys()) {
      stopProject(runtime, projectId);
    }

    saveState(runtime.state);
  };
}
