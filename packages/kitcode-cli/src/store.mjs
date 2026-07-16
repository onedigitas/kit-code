import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const STORE_DIR = path.join(os.homedir(), '.kitcode');
export const STORE_PATH = path.join(STORE_DIR, 'state.json');

function createEmptyState() {
  return {
    version: 4,
    projects: {},
  };
}

function normalizeCountedEntries(entries) {
  const normalized = {};

  if (!entries || typeof entries !== 'object') {
    return normalized;
  }

  for (const [id, entry] of Object.entries(entries)) {
    normalized[id] = {
      equals: Number(entry?.equals) || 0,
      counted_at: entry?.counted_at ?? null,
    };
  }

  return normalized;
}

function normalizeEqualsLedger(ledger) {
  if (!ledger || typeof ledger !== 'object') {
    return null;
  }

  const projects = {};

  if (ledger.projects && typeof ledger.projects === 'object') {
    for (const [projectId, projectLedger] of Object.entries(ledger.projects)) {
      if (!projectLedger || typeof projectLedger !== 'object') {
        continue;
      }

      const normalizedProjectId = String(projectLedger.project_id || projectId);
      const countedCommits = normalizeCountedEntries(projectLedger.counted_commits);
      const countedBatches = normalizeCountedEntries(projectLedger.counted_batches);
      const totalEquals = Number(projectLedger.total_equals)
        || Object.values(countedCommits).reduce((sum, entry) => sum + entry.equals, 0)
        + Object.values(countedBatches).reduce((sum, entry) => sum + entry.equals, 0);

      projects[normalizedProjectId] = {
        project_id: normalizedProjectId,
        repo_root: typeof projectLedger.repo_root === 'string' ? projectLedger.repo_root : null,
        source_type: projectLedger.source_type === 'vibe' ? 'vibe' : 'git',
        total_equals: totalEquals,
        counted_commits: countedCommits,
        counted_batches: countedBatches,
        first_counted_at: projectLedger.first_counted_at ?? null,
        last_updated_at: projectLedger.last_updated_at ?? null,
      };
    }
  }

  return {
    total_equals: Object.values(projects).reduce((sum, project) => sum + project.total_equals, 0),
    projects,
    earned_tiers: Array.isArray(ledger.earned_tiers) ? ledger.earned_tiers : [],
    first_counted_at: ledger.first_counted_at ?? null,
    last_updated_at: ledger.last_updated_at ?? null,
  };
}

function normalizeRewardSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return null;
  }

  const requiredSeconds = Number(settings.requiredSeconds);
  const requiredEquals = Number(settings.requiredEquals);

  if (!Number.isFinite(requiredSeconds) && !Number.isFinite(requiredEquals)) {
    return null;
  }

  return {
    requiredSeconds: Number.isFinite(requiredSeconds) && requiredSeconds > 0 ? requiredSeconds : undefined,
    requiredEquals: Number.isFinite(requiredEquals) && requiredEquals > 0 ? requiredEquals : undefined,
  };
}

function normalizeOnboarding(onboarding) {
  if (!onboarding || typeof onboarding !== 'object') {
    return null;
  }

  return {
    completed: onboarding.completed === true,
    autoTrack: onboarding.autoTrack === true,
    companionView: onboarding.companionView === 'pet' ? 'pet' : 'mini',
  };
}

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function normalizeState(state) {
  const ledger = normalizeEqualsLedger(state.equalsLedger);
  const rewardSettings = normalizeRewardSettings(state.rewardSettings);
  const onboarding = normalizeOnboarding(state.onboarding);

  const nextState = {...state};

  if (ledger) {
    nextState.equalsLedger = ledger;
  } else {
    delete nextState.equalsLedger;
  }

  if (rewardSettings) {
    nextState.rewardSettings = rewardSettings;
  } else {
    delete nextState.rewardSettings;
  }

  if (onboarding) {
    nextState.onboarding = onboarding;
  } else {
    delete nextState.onboarding;
  }

  return nextState;
}

function trySaveState(state) {
  try {
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

export function loadState() {
  const storedState = readJson(STORE_PATH) ?? createEmptyState();
  const state = normalizeState(storedState);

  if (state !== storedState) {
    trySaveState(state);
  }

  return state;
}

export function saveState(state) {
  const existingState = readJson(STORE_PATH) ?? {};
  const equalsLedger = normalizeEqualsLedger(state.equalsLedger)
    ?? normalizeEqualsLedger(existingState.equalsLedger);
  const rewardSettings = normalizeRewardSettings(state.rewardSettings)
    ?? normalizeRewardSettings(existingState.rewardSettings);
  const onboarding = normalizeOnboarding(state.onboarding)
    ?? normalizeOnboarding(existingState.onboarding);
  const nextState = {
    ...state,
  };

  if (equalsLedger) {
    nextState.equalsLedger = equalsLedger;
  } else {
    delete nextState.equalsLedger;
  }

  if (rewardSettings) {
    nextState.rewardSettings = rewardSettings;
  } else {
    delete nextState.rewardSettings;
  }

  if (onboarding) {
    nextState.onboarding = onboarding;
  } else {
    delete nextState.onboarding;
  }

  fs.mkdirSync(STORE_DIR, {recursive: true});
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(nextState, null, 2)}\n`);
}

export function onboardingPreferences() {
  return normalizeOnboarding(loadState().onboarding) ?? {
    completed: false,
    autoTrack: true,
    companionView: 'mini',
  };
}

export function saveOnboardingPreferences(preferences) {
  const next = normalizeOnboarding({...preferences, completed: preferences?.completed !== false});
  const state = loadState();
  state.onboarding = next;
  saveState(state);
  return next;
}
