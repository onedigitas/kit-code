import {countEqualsInHead, resolveHeadCommit} from './git.mjs';
import {loadState, saveState, STORE_PATH} from './store.mjs';

export const EQUALS_LEDGER_PATH = STORE_PATH;

function createEmptyLedger() {
  return {
    total_equals: 0,
    projects: {},
    counted_commits: {},
    counted_batches: {},
    earned_tiers: [],
    first_counted_at: null,
    last_updated_at: null,
  };
}

function normalizeLedger(ledger) {
  return {
    total_equals: Number(ledger?.total_equals) || 0,
    projects: ledger?.projects && typeof ledger.projects === 'object' ? ledger.projects : {},
    counted_commits: ledger?.counted_commits && typeof ledger.counted_commits === 'object'
      ? ledger.counted_commits
      : {},
    counted_batches: ledger?.counted_batches && typeof ledger.counted_batches === 'object'
      ? ledger.counted_batches
      : {},
    earned_tiers: Array.isArray(ledger?.earned_tiers) ? ledger.earned_tiers : [],
    first_counted_at: ledger?.first_counted_at ?? null,
    last_updated_at: ledger?.last_updated_at ?? null,
  };
}

export function loadEqualsLedger() {
  return normalizeLedger(loadState().equalsLedger);
}

function saveEqualsLedger(ledger) {
  const state = loadState();

  saveState({
    ...state,
    equalsLedger: normalizeLedger(ledger),
  });
}

export function countHeadEqualsOnce(repoRoot) {
  try {
    const head = resolveHeadCommit(repoRoot);
    const ledger = loadEqualsLedger();

    if (ledger.counted_commits[head.commitHash]) {
      return ledger.total_equals;
    }

    const equals = countEqualsInHead(head.repoRoot);
    const countedAt = new Date().toISOString();
    const project = ledger.projects[head.repoRoot] ?? {total_equals: 0};

    project.total_equals = (Number(project.total_equals) || 0) + equals;
    ledger.projects[head.repoRoot] = project;
    ledger.counted_commits[head.commitHash] = {
      repo_root: head.repoRoot,
      equals,
      counted_at: countedAt,
    };
    ledger.total_equals += equals;
    ledger.first_counted_at ??= countedAt;
    ledger.last_updated_at = countedAt;

    saveEqualsLedger(ledger);

    return ledger.total_equals;
  } catch {
    return loadEqualsLedger().total_equals;
  }
}

export function addVibeEqualsOnce(projectRoot, batchId, equals) {
  const ledger = loadEqualsLedger();

  if (equals <= 0 || ledger.counted_batches[batchId]) {
    return ledger.total_equals;
  }

  const countedAt = new Date().toISOString();
  const project = ledger.projects[projectRoot] ?? {total_equals: 0};

  project.total_equals = (Number(project.total_equals) || 0) + equals;
  ledger.projects[projectRoot] = project;
  ledger.counted_batches[batchId] = {
    project_root: projectRoot,
    equals,
    counted_at: countedAt,
  };
  ledger.total_equals += equals;
  ledger.first_counted_at ??= countedAt;
  ledger.last_updated_at = countedAt;

  saveEqualsLedger(ledger);

  return ledger.total_equals;
}

export function getTotalEquals() {
  return loadEqualsLedger().total_equals;
}
