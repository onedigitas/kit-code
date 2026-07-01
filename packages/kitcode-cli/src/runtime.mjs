import fs from 'node:fs';
import path from 'node:path';
import {countCommits, createProjectId, detectRepoRoot, getGitSignature, parseCommits} from './git.mjs';
import {loadState, saveState} from './store.mjs';

export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_PORT = 4747;
export const DEFAULT_REWARD_SECONDS = 7200;

const IDLE_AFTER_MS = 5 * 60 * 1000;

function publicProject(project) {
  return {
    id: project.id,
    name: project.name,
    activeSeconds: Math.floor(project.activeSeconds),
    idleSeconds: Math.floor(project.idleSeconds),
    commitCount: project.commitCount,
    lastActiveAt: project.lastActiveAt,
  };
}

export function createRuntime(options) {
  const repoRoot = detectRepoRoot(process.cwd());
  const projectId = createProjectId(repoRoot);
  const state = loadState();
  const now = new Date().toISOString();
  const project = state.projects[projectId] ?? {
    id: projectId,
    name: path.basename(repoRoot),
    repoRoot,
    activeSeconds: 0,
    idleSeconds: 0,
    commitCount: 0,
    lastActiveAt: now,
    commits: [],
  };

  project.name = path.basename(repoRoot);
  project.repoRoot = repoRoot;
  state.projects[projectId] = project;

  const runtime = {
    options,
    repoRoot,
    projectId,
    state,
    lastTick: Date.now(),
    lastActivityAt: Date.now(),
    lastGitSignature: getGitSignature(repoRoot),
  };

  refreshCommits(runtime);
  saveState(state);

  return runtime;
}

export function refreshCommits(runtime) {
  const project = runtime.state.projects[runtime.projectId];
  project.commits = parseCommits(runtime.repoRoot);
  project.commitCount = countCommits(runtime.repoRoot);
  project.lastActiveAt = new Date().toISOString();
}

export function touchActivity(runtime) {
  runtime.lastActivityAt = Date.now();
  runtime.state.projects[runtime.projectId].lastActiveAt = new Date().toISOString();
}

export function tickTime(runtime) {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - runtime.lastTick) / 1000);
  const project = runtime.state.projects[runtime.projectId];

  if (now - runtime.lastActivityAt > IDLE_AFTER_MS) {
    project.idleSeconds += elapsedSeconds;
  } else {
    project.activeSeconds += elapsedSeconds;
  }

  runtime.lastTick = now;
}

export function buildSummary(runtime) {
  const projects = Object.values(runtime.state.projects).map(publicProject).sort((a, b) => {
    return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
  });
  const totalActiveSeconds = projects.reduce((sum, project) => sum + project.activeSeconds, 0);
  const totalIdleSeconds = projects.reduce((sum, project) => sum + project.idleSeconds, 0);
  const totalCommits = projects.reduce((sum, project) => sum + project.commitCount, 0);
  const requiredSeconds = Math.max(1, runtime.options.rewardSeconds);
  const earnedSeconds = totalActiveSeconds;

  return {
    connected: true,
    currentProject: publicProject(runtime.state.projects[runtime.projectId]),
    projects,
    global: {
      totalActiveSeconds,
      totalIdleSeconds,
      totalCommits,
      totalProjects: projects.length,
    },
    reward: {
      requiredSeconds,
      earnedSeconds,
      timeLeftSeconds: Math.max(0, requiredSeconds - earnedSeconds),
      progress: Math.min(1, earnedSeconds / requiredSeconds),
    },
  };
}

export function startWatchers(runtime) {
  const persistTimer = setInterval(() => saveState(runtime.state), 10000);
  const timeTimer = setInterval(() => tickTime(runtime), 1000);
  const gitTimer = setInterval(() => {
    const signature = getGitSignature(runtime.repoRoot);

    if (signature !== runtime.lastGitSignature) {
      runtime.lastGitSignature = signature;
      touchActivity(runtime);
      refreshCommits(runtime);
    }
  }, 15000);

  let watcher;
  try {
    watcher = fs.watch(runtime.repoRoot, {recursive: true}, (_eventType, fileName) => {
      const normalized = String(fileName ?? '');

      if (
        normalized.startsWith('.git') ||
        normalized.startsWith('node_modules') ||
        normalized.startsWith('dist')
      ) {
        return;
      }

      touchActivity(runtime);
    });
  } catch {
    watcher = undefined;
  }

  return () => {
    clearInterval(persistTimer);
    clearInterval(timeTimer);
    clearInterval(gitTimer);
    watcher?.close();
    tickTime(runtime);
    saveState(runtime.state);
  };
}
