import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const STORE_PATH = path.join(os.homedir(), '.kitcode', 'state.json');

function createEmptyState() {
  return {
    version: 1,
    projects: {},
  };
}

export function loadState() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return createEmptyState();
    }

    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return createEmptyState();
  }
}

export function saveState(state) {
  fs.mkdirSync(path.dirname(STORE_PATH), {recursive: true});
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}
