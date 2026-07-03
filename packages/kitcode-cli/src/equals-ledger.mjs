import {loadState, saveState, STORE_PATH} from './store.mjs';

export const EQUALS_LEDGER_PATH = STORE_PATH;

function createEmptyLedger() {
  return {
    total_equals: 0,
    projects: {},
    earned_tiers: [],
    first_counted_at: null,
    last_updated_at: null,
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

function normalizeProjectLedger(projectId, projectLedger = {}) {
  const countedCommits = normalizeCountedEntries(projectLedger.counted_commits);
  const countedBatches = normalizeCountedEntries(projectLedger.counted_batches);
  const totalEquals = Number(projectLedger.total_equals)
    || Object.values(countedCommits).reduce((sum, entry) => sum + entry.equals, 0)
    + Object.values(countedBatches).reduce((sum, entry) => sum + entry.equals, 0);

  return {
    project_id: projectId,
    repo_root: typeof projectLedger.repo_root === 'string' ? projectLedger.repo_root : null,
    source_type: projectLedger.source_type === 'vibe' ? 'vibe' : 'git',
    total_equals: totalEquals,
    counted_commits: countedCommits,
    counted_batches: countedBatches,
    first_counted_at: projectLedger.first_counted_at ?? null,
    last_updated_at: projectLedger.last_updated_at ?? null,
  };
}

function normalizeLedger(ledger) {
  const projects = {};

  if (ledger?.projects && typeof ledger.projects === 'object') {
    for (const [projectId, projectLedger] of Object.entries(ledger.projects)) {
      projects[projectId] = normalizeProjectLedger(projectId, projectLedger);
    }
  }

  const totalEquals = Object.values(projects).reduce((sum, project) => sum + project.total_equals, 0);

  return {
    total_equals: totalEquals,
    projects,
    earned_tiers: Array.isArray(ledger?.earned_tiers) ? ledger.earned_tiers : [],
    first_counted_at: ledger?.first_counted_at ?? null,
    last_updated_at: ledger?.last_updated_at ?? null,
  };
}

function ensureProjectLedger(ledger, project) {
  const projectId = project.id ?? project.project_id;
  const existing = ledger.projects[projectId];
  const projectLedger = normalizeProjectLedger(projectId, {
    ...existing,
    repo_root: project.repoRoot ?? project.repo_root ?? existing?.repo_root,
    source_type: project.sourceType ?? project.source_type ?? existing?.source_type,
  });

  ledger.projects[projectId] = projectLedger;
  return projectLedger;
}

function refreshLedgerTotals(ledger) {
  ledger.total_equals = Object.values(ledger.projects).reduce((sum, project) => sum + project.total_equals, 0);
  return ledger;
}

export function loadEqualsLedger() {
  return normalizeLedger(loadState().equalsLedger);
}

export function saveEqualsLedger(ledger) {
  const state = loadState();

  saveState({
    ...state,
    equalsLedger: normalizeLedger(ledger),
  });
}

export function addSourceEqualsOnce(project, batchId, equals) {
  const ledger = loadEqualsLedger();
  const projectLedger = ensureProjectLedger(ledger, project);

  if (equals <= 0 || projectLedger.counted_batches[batchId]) {
    return ledger.total_equals;
  }

  const countedAt = new Date().toISOString();
  projectLedger.counted_batches[batchId] = {
    equals,
    counted_at: countedAt,
  };
  projectLedger.total_equals += equals;
  projectLedger.first_counted_at ??= countedAt;
  projectLedger.last_updated_at = countedAt;
  ledger.first_counted_at ??= countedAt;
  ledger.last_updated_at = countedAt;

  saveEqualsLedger(refreshLedgerTotals(ledger));

  return ledger.total_equals;
}

export const addVibeEqualsOnce = addSourceEqualsOnce;

export function getTotalEquals() {
  return loadEqualsLedger().total_equals;
}

export function removeProjectEquals(projectId) {
  const ledger = loadEqualsLedger();

  if (!ledger.projects[projectId]) {
    return ledger;
  }

  delete ledger.projects[projectId];
  ledger.last_updated_at = new Date().toISOString();
  saveEqualsLedger(refreshLedgerTotals(ledger));

  return loadEqualsLedger();
}
