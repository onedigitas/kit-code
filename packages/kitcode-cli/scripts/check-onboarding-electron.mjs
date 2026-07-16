import {strict as assert} from 'node:assert';
import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderOnboardingWindow} from '../src/onboarding-window.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const preloadPath = path.join(scriptDirectory, 'fixtures/onboarding-test-preload.cjs');
const projects = {
  first: {id: 'project-1', repoRoot: '/workspace/first-project', sourceType: 'git', active: true},
  second: {id: 'project-2', repoRoot: '/workspace/second-project', sourceType: 'vibe', active: true},
  third: {id: 'project-3', repoRoot: '/workspace/third-project', sourceType: 'git', active: true},
};
let pickerCalls = 0;
const submissions = [];

app.commandLine.appendSwitch('disable-gpu');
const readyWatchdog = setTimeout(() => {
  console.error('Electron app.ready timed out');
  app.exit(2);
}, 15000);
await app.whenReady();
clearTimeout(readyWatchdog);
app.dock?.hide();

ipcMain.handle('kitcode:test-onboarding-initial-state', () => ({
  completed: true,
  autoTrack: false,
  companionView: 'mini',
  projects: [projects.first],
}));
ipcMain.handle('kitcode:test-onboarding-select-folders', () => {
  pickerCalls += 1;
  return pickerCalls === 1
    ? {canceled: false, projects: [projects.second]}
    : {canceled: false, projects: [projects.second, projects.third]};
});
ipcMain.handle('kitcode:test-onboarding-submit', (_event, input) => {
  submissions.push(input);
  if (submissions.length === 1) {
    return {
      ok: false,
      error: 'Projects were saved, but the tracker could not start.',
      projects: [projects.first, projects.third],
    };
  }
  return {ok: true, projects: [projects.first, projects.third]};
});
ipcMain.handle('kitcode:test-onboarding-close', () => ({closed: true}));

const window = new BrowserWindow({
  width: 760,
  height: 610,
  show: false,
  frame: false,
  webPreferences: {
    preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  },
});

await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(renderOnboardingWindow('linux'))}`);

const result = await window.webContents.executeJavaScript(`(async () => {
  const waitFor = async (predicate, label) => {
    const started = Date.now();
    while (!predicate()) {
      if (Date.now() - started > 3000) throw new Error('Timed out waiting for ' + label);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };
  const byTestId = (id) => document.querySelector('[data-testid="' + id + '"]');
  const projectCount = document.getElementById('projectCount');
  const yes = byTestId('auto-track-yes');
  const no = byTestId('auto-track-no');

  await waitFor(() => projectCount.textContent === '1 added', 'initial project state');
  if (!no.checked || yes.checked) throw new Error('Persisted NO preference was not restored');

  no.focus();
  no.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
  if (document.activeElement !== yes || yes.checked) throw new Error('ArrowUp must move focus without selecting');
  yes.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true}));
  if (!yes.checked || no.checked) throw new Error('Space must exclusively select YES');
  no.focus();
  no.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
  if (!no.checked || yes.checked) throw new Error('Enter must exclusively select NO');
  if (document.activeElement !== byTestId('add-projects')) throw new Error('Enter must advance to Add Projects');

  byTestId('add-projects').click();
  await waitFor(() => projectCount.textContent === '2 added', 'first cumulative picker result');
  byTestId('add-projects').click();
  await waitFor(() => projectCount.textContent === '3 added', 'deduplicated second picker result');
  if (document.querySelectorAll('[data-testid="pending-project-row"]').length !== 2) throw new Error('Expected two unique pending projects');

  byTestId('remove-pending-project').click();
  await waitFor(() => projectCount.textContent === '2 added', 'pending removal');
  if (document.querySelectorAll('[data-testid="persisted-project-row"]').length !== 1) throw new Error('Pending removal changed persisted projects');

  byTestId('companion-pet').click();
  if (!byTestId('companion-pet').checked) throw new Error('Pet companion selection did not update');

  byTestId('save-setup').click();
  await waitFor(() => byTestId('save-setup').textContent === 'Retry save', 'recoverable tracker failure');
  if (document.getElementById('message').dataset.state !== 'error') throw new Error('Failure state was not announced');
  byTestId('save-setup').click();
  await waitFor(() => byTestId('save-setup').textContent === 'Setup complete', 'retry success');

  if (document.body.scrollWidth > window.innerWidth || document.body.scrollHeight > window.innerHeight) {
    throw new Error('Setup overflows the fixed Electron viewport');
  }

  return {
    count: projectCount.textContent,
    companion: document.querySelector('input[name="companionView"]:checked').value,
    status: document.getElementById('statusText').textContent,
  };
})()`);

assert.equal(pickerCalls, 2, 'Expected two cumulative native picker passes');
assert.equal(submissions.length, 2, 'Expected failure followed by one retry');
assert.deepEqual(submissions[0].folders, [projects.third.repoRoot], 'Removed and duplicate projects must not be submitted');
assert.equal(submissions[0].autoTrack, false, 'NO must apply to the shared tracker submission');
assert.equal(submissions[0].companionView, 'pet', 'Companion choice must be preserved in submission');
assert.deepEqual(submissions[1].folders, [], 'Retry must not re-register projects saved by the failed tracker start');
assert.equal(result.count, '2 added');
assert.equal(result.companion, 'pet');
assert.equal(result.status, 'setup:complete');

window.destroy();
for (const channel of [
  'kitcode:test-onboarding-initial-state',
  'kitcode:test-onboarding-select-folders',
  'kitcode:test-onboarding-submit',
  'kitcode:test-onboarding-close',
]) ipcMain.removeHandler(channel);
app.quit();

console.log('Native onboarding interaction checks passed.');
