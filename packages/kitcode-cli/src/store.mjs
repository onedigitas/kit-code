import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const STORE_DIR = path.join(os.homedir(), '.kitcode');
export const STORE_PATH = path.join(STORE_DIR, 'state.json');
export const LEGACY_CODEX_LEDGER_PATH = path.join(os.homedir(), '.codex', 'kitcode', 'state.json');

function createEmptyState() {
  return {
    version: 4,
    projects: {},
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

function withMigratedLedger(state) {
  if (state.equalsLedger) {
    return state;
  }

  const legacyLedger = readJson(LEGACY_CODEX_LEDGER_PATH);

  if (!legacyLedger) {
    return state;
  }

  return {
    ...state,
    equalsLedger: legacyLedger,
  };
}

export function loadState() {
  const storedState = readJson(STORE_PATH) ?? createEmptyState();
  const state = withMigratedLedger(storedState);

  if (state !== storedState) {
    saveState(state);
  }

  return state;
}

export function saveState(state) {
  const existingState = readJson(STORE_PATH) ?? {};
  const nextState = {
    ...state,
    equalsLedger: state.equalsLedger ?? existingState.equalsLedger,
  };

  fs.mkdirSync(STORE_DIR, {recursive: true});
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(nextState, null, 2)}\n`);
}
