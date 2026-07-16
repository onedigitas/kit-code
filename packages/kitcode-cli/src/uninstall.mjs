import fs from 'node:fs';
import process from 'node:process';
import {uninstallIntegration} from './integration-installers.mjs';
import {AGENT_SPECS} from './integration-spec.mjs';
import {uninstallSkillTree} from './skill-installer.mjs';
import {STORE_DIR} from './store.mjs';

const TRACKER_PATH = `${STORE_DIR}/tracker.json`;
const INTEGRATION_SOURCES = Object.keys(AGENT_SPECS);

function readTrackerMetadata() {
  try {
    if (!fs.existsSync(TRACKER_PATH)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function removeTrackerMetadata() {
  try {
    fs.rmSync(TRACKER_PATH, {force: true});
  } catch {}
}

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerRunning(host, port) {
  try {
    const response = await fetch(`http://${host}:${port}/api/health`, {
      signal: AbortSignal.timeout(800),
    });

    if (!response.ok) {
      return false;
    }

    const health = await response.json();
    return health?.status === 'ok' && health?.app === 'kitcode';
  } catch {
    return false;
  }
}

export async function stopTrackerForUninstall() {
  const metadata = readTrackerMetadata();
  const host = metadata?.host ?? '127.0.0.1';
  const port = Number(metadata?.port ?? 4747);
  const pid = Number(metadata?.pid);

  if (!metadata || !isProcessRunning(pid)) {
    removeTrackerMetadata();
    return {stopped: false, host, port};
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    removeTrackerMetadata();
    return {stopped: false, host, port};
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (!isProcessRunning(pid) || !(await isServerRunning(host, port))) {
      removeTrackerMetadata();
      return {stopped: true, host, port};
    }

    await sleep(200);
  }

  removeTrackerMetadata();
  return {stopped: 'requested', host, port};
}

export async function uninstallKitCode() {
  const report = {
    tracker: await stopTrackerForUninstall(),
    integrations: {},
    skills: {},
    store: {removed: false, path: STORE_DIR},
  };

  for (const source of INTEGRATION_SOURCES) {
    report.integrations[source] = uninstallIntegration(source);
    report.skills[source] = uninstallSkillTree(source);
  }

  if (fs.existsSync(STORE_DIR)) {
    fs.rmSync(STORE_DIR, {recursive: true, force: true});
    report.store.removed = true;
  }

  return report;
}
