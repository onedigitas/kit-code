import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {strict as assert} from 'node:assert';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const binPath = path.resolve(repoRoot, 'packages/kitcode-cli/bin/kitcode.mjs');
const cliSource = fs.readFileSync(binPath, 'utf8');
const openDashboardSource = fs.readFileSync(path.resolve(repoRoot, 'packages/kitcode-cli/src/open-dashboard.mjs'), 'utf8');
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
assert.equal((`${cliSource}${openDashboardSource}`.match(/windowsHide: true/g) ?? []).length, 3, 'Non-GUI detached CLI subprocesses must stay hidden on Windows');
assert.match(cliSource, /windowsHide: false/, 'Electron GUI launches must allow the desktop window to show on Windows');
assert.match(cliSource, /ELECTRON_READY_MS/, 'Electron GUI launch must wait for process liveness before success');
assert.match(cliSource, /reason: 'exited'/, 'Electron GUI launch must treat early process exit as failure');
assert.match(cliSource, /KITCODE_DRY_ELECTRON === 'fail'/, 'Electron GUI launch must support a forced-failure mode for focused checks');
assert.match(cliSource, /KITCODE_DRY_ELECTRON/, 'Electron GUI launch must support a dry-run mode for focused checks');
assert.match(cliSource, /Opening KitCode Welcome\.\.\./, 'Shared onboarding open path must print Welcome launch intent');
assert.match(cliSource, /await openOnboardingWindow\(options\)/, 'setup must await Welcome launch result');
assert.match(cliSource, /if \(!\(await openOnboardingWindow\(options\)\)\) \{\s*process\.exit\(1\);/s, 'setup must exit nonzero when Welcome launch fails');
assert.match(cliSource, /await handleHookInstaller\('codex'/, 'codex on must await Welcome launch when onboarding is incomplete');
assert.match(cliSource, /process\.exitCode = 1/, 'incomplete codex\/claude on must mark failure when Welcome launch fails');
assert.match(cliSource, /Fix Electron install, then re-run `kitcode setup`/, 'incomplete integration on must tell the user how to recover Welcome');
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
      KITCODE_DRY_ELECTRON: options.dryElectron ?? '1',
      NO_COLOR: '1',
      ...options.env,
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
  assert.match(result.stdout, /^\s+status\s+/m);
  assert.match(result.stdout, /^\s+summary\s+/m);
  assert.match(result.stdout, /^\s+awards\s+/m);
  assert.match(result.stdout, /dashboard/);
  assert.match(result.stdout, /terminal/);
  assert.match(result.stdout, /^\s+pet\s+/m);
  assert.match(result.stdout, /^\s+uninstall\s+/m);
  assert.match(result.stdout, /--yes/);
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
  const state = readState();
  const projectId = Object.entries(state.projects)
    .find(([, project]) => project.repoRoot === secondProject)?.[0];

  assert.ok(projectId, 'Expected second tracked project id');
  state.projects[projectId].activeSeconds = 600;
  state.equalsLedger = {
    total_equals: 6,
    projects: {
      [projectId]: {
        project_id: projectId,
        repo_root: secondProject,
        source_type: 'vibe',
        total_equals: 6,
        counted_commits: {},
        counted_batches: {
          batch: {equals: 6, counted_at: '2026-07-02T00:00:00.000Z'},
        },
      },
    },
    earned_tiers: [],
    first_counted_at: '2026-07-02T00:00:00.000Z',
    last_updated_at: '2026-07-02T00:00:00.000Z',
  };
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

  const summary = run(['summary']);

  assert.equal(summary.status, 0);
  assert.match(summary.stdout, /KitCode summary/);
  assert.match(summary.stdout, /= counted: 6/);
  assert.match(summary.stdout, /ready: 10%/);

  const awards = run(['awards']);

  assert.equal(awards.status, 0);
  assert.match(awards.stdout, /KitCode awards/);
  assert.match(awards.stdout, /10% reward/);

  const status = run(['status', '--port', String(testPort)]);

  assert.equal(status.status, 0);
  assert.match(status.stdout, /KitCode status/);
  assert.match(status.stdout, /tracker: running/);

  const hook = spawnSync(process.execPath, [binPath, 'hook', 'prompt', '--source', 'codex'], {
    cwd: firstProject,
    env: {
      ...process.env,
      HOME: homeDir,
      USERPROFILE: homeDir,
      KITCODE_NO_OPEN: '1',
      NO_COLOR: '1',
    },
    input: JSON.stringify({prompt: 'keep going'}),
    encoding: 'utf8',
  });

  assert.equal(hook.status, 0);
  assert.match(hook.stdout, /KitCode progress/);
  assert.match(hook.stdout, /6 = counted/);
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

{
  const setupOk = run(['setup']);

  assert.equal(setupOk.status, 0);
  assert.match(setupOk.stdout, /Opening KitCode Welcome/);
}

{
  const setupFail = run(['setup'], {dryElectron: 'fail'});

  assert.equal(setupFail.status, 1);
  assert.match(setupFail.stdout, /Opening KitCode Welcome/);
  assert.match(setupFail.stderr, /KitCode Welcome could not open/);
  assert.match(setupFail.stderr, /npm install -g @onedigitas\/kitcode/);
}

{
  const onFail = run(['codex', 'on'], {dryElectron: 'fail'});

  assert.equal(onFail.status, 1);
  assert.match(onFail.stdout, /Opening KitCode Welcome/);
  assert.match(onFail.stderr, /KitCode Welcome could not open/);
  assert.match(onFail.stderr, /Fix Electron install, then re-run `kitcode setup`/);

  const cleanup = run(['uninstall', '--yes']);
  assert.equal(cleanup.status, 0);
}

{
  const codexOn = run(['codex', 'on']);

  assert.equal(codexOn.status, 0);
  assert.match(codexOn.stdout, /Opening KitCode Welcome/);
  assert.equal(fs.existsSync(path.join(homeDir, '.codex/skills/kitcode/SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(homeDir, '.kitcode/bin/kitcode')), true);

  const uninstall = run(['uninstall', '--yes']);

  assert.equal(uninstall.status, 0);
  assert.match(uninstall.stdout, /KitCode uninstall complete/);
  assert.equal(fs.existsSync(path.join(homeDir, '.kitcode')), false);
  assert.equal(fs.existsSync(path.join(homeDir, '.codex/skills/kitcode')), false);
}

console.log('CLI command checks passed.');
