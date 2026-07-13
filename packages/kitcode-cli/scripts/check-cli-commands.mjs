import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {strict as assert} from 'node:assert';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const binPath = path.resolve(repoRoot, 'packages/kitcode-cli/bin/kitcode.mjs');
const cliSource = fs.readFileSync(binPath, 'utf8');
const gitSource = fs.readFileSync(path.resolve(repoRoot, 'packages/kitcode-cli/src/git.mjs'), 'utf8');
const onboardingSource = fs.readFileSync(path.resolve(repoRoot, 'packages/kitcode-cli/src/onboarding-electron.mjs'), 'utf8');
const hookSource = fs.readFileSync(path.resolve(repoRoot, 'packages/kitcode-cli/src/hook-prompt.mjs'), 'utf8');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kitcode-cli-'));
const homeDir = path.join(tempRoot, 'home');
const firstProject = path.join(tempRoot, 'first');
const secondProject = path.join(tempRoot, 'second');
const statePath = path.join(homeDir, '.kitcode/state.json');
const trackerPath = path.join(homeDir, '.kitcode/tracker.json');
const testPort = 25000 + (process.pid % 10000);

fs.mkdirSync(homeDir, {recursive: true});
fs.mkdirSync(firstProject, {recursive: true});
fs.mkdirSync(secondProject, {recursive: true});
fs.writeFileSync(path.join(firstProject, 'index.js'), 'const first = 1;\n');
fs.writeFileSync(path.join(secondProject, 'index.js'), 'const second = 2;\n');

assert.equal((gitSource.match(/windowsHide: true/g) ?? []).length, 2, 'Every recurring Git subprocess must stay hidden on Windows');
assert.equal((cliSource.match(/windowsHide: true/g) ?? []).length, 4, 'Every detached CLI subprocess must stay hidden on Windows');
assert.equal((onboardingSource.match(/windowsHide: true/g) ?? []).length, 2, 'Setup subprocesses must stay hidden on Windows');
assert.equal((hookSource.match(/windowsHide: true/g) ?? []).length, 1, 'Notification subprocesses must stay hidden on Windows');

function run(args, options = {}) {
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd: options.cwd ?? firstProject,
    env: {
      ...process.env,
      HOME: homeDir,
      USERPROFILE: homeDir,
      KITCODE_NO_OPEN: '1',
      NO_COLOR: '1',
    },
    encoding: 'utf8',
  });
}

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

{
  const result = run(['--help']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /add \[path\]/);
  assert.match(result.stdout, /remove \[path\]/);
  assert.match(result.stdout, /^\s+track\s+/m);
  assert.match(result.stdout, /^\s+untrack\s+/m);
  assert.match(result.stdout, /dashboard/);
  assert.match(result.stdout, /terminal/);
  assert.match(result.stdout, /^\s+pet\s+/m);
  assert.match(result.stdout, /--pet/);
  assert.doesNotMatch(result.stdout, /^\s+mini\s+/m);
  assert.doesNotMatch(result.stdout, /^\s+serve\s/m);
  assert.doesNotMatch(result.stdout, /^\s+break\s/m);
  assert.doesNotMatch(result.stdout, /^\s+reward\s/m);
  assert.doesNotMatch(result.stdout, /^\s+redeem\s/m);
}

{
  const result = run([]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: kitcode/);
  assert.equal(fs.existsSync(statePath), false);
}

{
  const dashboard = run(['dashboard', '--port', String(testPort)]);

  assert.equal(dashboard.status, 1);
  assert.match(dashboard.stderr, /KitCode tracker is not running/);

  const terminal = run(['terminal', '--port', String(testPort)]);

  assert.equal(terminal.status, 1);
  assert.match(terminal.stderr, /KitCode tracker is not running/);

  const pet = run(['pet', '--port', String(testPort)]);

  assert.equal(pet.status, 1);
  assert.match(pet.stderr, /KitCode tracker is not running/);
}

{
  const track = run(['track', '--port', String(testPort)]);

  assert.equal(track.status, 0);
  assert.match(track.stdout, /KitCode tracker started/);
  assert.equal(Object.keys(readState().projects).length, 0);
  assert.equal(fs.existsSync(trackerPath), true);

  const again = run(['track', '--port', String(testPort)]);

  assert.equal(again.status, 0);
  assert.match(again.stdout, /KitCode tracker is already running/);
}

{
  const first = run(['add', firstProject]);

  assert.equal(first.status, 0);
  assert.match(first.stdout, /Project added to KitCode/);
  assert.equal(Object.keys(readState().projects).length, 1);
  assert.ok(Object.values(readState().projects)[0].sourceSnapshot?.files);

  const second = run(['add', secondProject]);

  assert.equal(second.status, 0);
  assert.equal(Object.keys(readState().projects).length, 2);
}

{
  const state = readState();
  const projectId = Object.entries(state.projects)
    .find(([, project]) => project.repoRoot === firstProject)?.[0];

  assert.ok(projectId, 'Expected first tracked project id');
  state.equalsLedger = {
    total_equals: 9,
    projects: {
      [projectId]: {
        project_id: projectId,
        repo_root: firstProject,
        source_type: 'vibe',
        total_equals: 9,
        counted_commits: {},
        counted_batches: {
          batch: {equals: 9, counted_at: '2026-07-02T00:00:00.000Z'},
        },
      },
    },
    earned_tiers: [],
    first_counted_at: '2026-07-02T00:00:00.000Z',
    last_updated_at: '2026-07-02T00:00:00.000Z',
  };
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

  const result = run(['remove', firstProject]);
  const nextState = readState();

  assert.equal(result.status, 0);
  assert.equal(nextState.projects[projectId], undefined);
  assert.equal(nextState.equalsLedger.projects[projectId], undefined);
  assert.equal(nextState.equalsLedger.total_equals, 0);
}

{
  const before = readState();
  const result = run(['untrack', '--port', String(testPort)]);
  const after = readState();

  assert.equal(result.status, 0);
  assert.match(result.stdout, /KitCode tracker stopped|KitCode tracker stop requested/);
  assert.deepEqual(Object.keys(after.projects), Object.keys(before.projects));
}

for (const command of ['mini', 'serve', 'break', 'start', 'stop', 'reward', 'redeem']) {
  const result = run([command]);

  assert.equal(result.status, 1, `${command} should be removed`);
  assert.match(result.stdout, /Usage: kitcode/);
}

console.log('CLI command checks passed.');
