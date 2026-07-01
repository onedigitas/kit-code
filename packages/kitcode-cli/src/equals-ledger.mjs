import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {countEqualsInHead, resolveHeadCommit} from './git.mjs';

export const EQUALS_LEDGER_PATH = path.join(os.homedir(), '.codex', 'kitcode', 'state.json');

function createEmptyLedger() {
  return {
    total_equals: 0,
    projects: {},
    counted_commits: {},
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
    earned_tiers: Array.isArray(ledger?.earned_tiers) ? ledger.earned_tiers : [],
    first_counted_at: ledger?.first_counted_at ?? null,
    last_updated_at: ledger?.last_updated_at ?? null,
  };
}

export function loadEqualsLedger() {
  try {
    if (!fs.existsSync(EQUALS_LEDGER_PATH)) {
      return createEmptyLedger();
    }

    return normalizeLedger(JSON.parse(fs.readFileSync(EQUALS_LEDGER_PATH, 'utf8')));
  } catch {
    return createEmptyLedger();
  }
}

function saveEqualsLedger(ledger) {
  fs.mkdirSync(path.dirname(EQUALS_LEDGER_PATH), {recursive: true});
  fs.writeFileSync(EQUALS_LEDGER_PATH, `${JSON.stringify(normalizeLedger(ledger), null, 2)}\n`);
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

export function getTotalEquals() {
  return loadEqualsLedger().total_equals;
}
