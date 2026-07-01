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

  return {
    total_equals: Number(ledger.total_equals) || 0,
    counted_commits: normalizeCountedEntries(ledger.counted_commits),
    counted_batches: normalizeCountedEntries(ledger.counted_batches),
    earned_tiers: Array.isArray(ledger.earned_tiers) ? ledger.earned_tiers : [],
    first_counted_at: ledger.first_counted_at ?? null,
    last_updated_at: ledger.last_updated_at ?? null,
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

  if (ledger) {
    return {
      ...state,
      equalsLedger: ledger,
    };
  }

  const nextState = {...state};
  delete nextState.equalsLedger;

  return nextState;
}

export function loadState() {
  const storedState = readJson(STORE_PATH) ?? createEmptyState();
  const state = normalizeState(storedState);

  if (state !== storedState) {
    saveState(state);
  }

  return state;
}

export function saveState(state) {
  const existingState = readJson(STORE_PATH) ?? {};
  const equalsLedger = normalizeEqualsLedger(state.equalsLedger)
    ?? normalizeEqualsLedger(existingState.equalsLedger);
  const nextState = {
    ...state,
  };

  if (equalsLedger) {
    nextState.equalsLedger = equalsLedger;
  }

  fs.mkdirSync(STORE_DIR, {recursive: true});
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(nextState, null, 2)}\n`);
}
