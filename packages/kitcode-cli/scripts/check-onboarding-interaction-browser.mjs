import {strict as assert} from 'node:assert';
import {spawn} from 'node:child_process';
import http from 'node:http';
import {promisify} from 'node:util';
import {renderOnboardingWindow} from '../src/onboarding-window.mjs';

const sleep = promisify(setTimeout);
const port = Number(process.env.KITCODE_ONBOARDING_BROWSER_PORT) || 4791;
const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
].filter(Boolean);

const projects = {
  first: {id: 'project-1', repoRoot: '/workspace/first-project', sourceType: 'git', active: true},
  second: {id: 'project-2', repoRoot: '/workspace/second-project', sourceType: 'vibe', active: true},
  third: {id: 'project-3', repoRoot: '/workspace/third-project', sourceType: 'git', active: true},
};

const bridge = `<script>
  const testProjects = ${JSON.stringify(projects)};
  window.__testPickerCalls = 0;
  window.__testSubmissions = [];
  window.kitcodeOnboarding = {
    initialState: async () => ({completed: true, autoTrack: false, companionView: 'mini', projects: [testProjects.first]}),
    selectFolders: async () => {
      window.__testPickerCalls += 1;
      return window.__testPickerCalls === 1
        ? {canceled: false, projects: [testProjects.second]}
        : {canceled: false, projects: [testProjects.second, testProjects.third]};
    },
    submit: async (input) => {
      window.__testSubmissions.push(input);
      return window.__testSubmissions.length === 1
        ? {ok: false, error: 'Projects were saved, but the tracker could not start.', projects: [testProjects.first, testProjects.third]}
        : {ok: true, projects: [testProjects.first, testProjects.third]};
    },
    removeProject: async (projectId) => ({
      ok: true,
      projects: [testProjects.first, testProjects.second, testProjects.third].filter((project) => project.id !== projectId),
    }),
    close: async () => ({closed: true}),
  };
</script>`;

const interactionTest = `<script>
  (async () => {
    const waitFor = async (predicate, label) => {
      const started = Date.now();
      while (!predicate()) {
        if (Date.now() - started > 5000) throw new Error('Timed out waiting for ' + label);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    };
    const byTestId = (id) => document.querySelector('[data-testid="' + id + '"]');
    const projectCount = document.getElementById('projectCount');
    const yes = byTestId('auto-track-yes');
    const no = byTestId('auto-track-no');

    await waitFor(() => projectCount.textContent === '1 ADDED', 'initial project state');
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
    await waitFor(() => projectCount.textContent === '2 ADDED', 'first cumulative picker result');
    byTestId('add-projects').click();
    await waitFor(() => projectCount.textContent === '3 ADDED', 'deduplicated second picker result');
    if (document.querySelectorAll('[data-testid="pending-project-row"]').length !== 2) throw new Error('Expected two unique pending projects');

    document.querySelector('[data-testid="pending-project-row"] [data-testid="remove-project"]').click();
    await waitFor(() => projectCount.textContent === '2 ADDED', 'pending removal');
    if (document.querySelectorAll('[data-testid="persisted-project-row"]').length !== 1) throw new Error('Pending removal changed persisted projects');

    byTestId('companion-pet').click();
    if (!byTestId('companion-pet').checked) throw new Error('Pet companion selection did not update');

    byTestId('save-setup').click();
    await waitFor(() => byTestId('save-setup').textContent === 'Retry Save', 'recoverable tracker failure');
    if (document.getElementById('message').dataset.state !== 'error') throw new Error('Failure state was not announced');
    byTestId('save-setup').click();
    await waitFor(() => byTestId('save-setup').textContent === 'Setup Complete', 'retry success');

    if (document.body.scrollWidth > window.innerWidth || document.body.scrollHeight > window.innerHeight) {
      throw new Error('Setup overflows the fixed viewport');
    }

    document.documentElement.dataset.testResult = JSON.stringify({
      ok: true,
      pickerCalls: window.__testPickerCalls,
      submissions: window.__testSubmissions,
      count: projectCount.textContent,
      companion: document.querySelector('input[name="companionView"]:checked').value,
      status: document.getElementById('statusText').textContent,
    });
  })().catch((error) => {
    document.documentElement.dataset.testResult = JSON.stringify({ok: false, error: error.message});
  });
</script>`;

const html = renderOnboardingWindow('linux')
  .replace('<script>', bridge + '<script>')
  .replace('</body>', interactionTest + '</body>');

const server = http.createServer((_request, response) => {
  response.writeHead(200, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'});
  response.end(html);
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});

let chromePath;
for (const candidate of chromeCandidates) {
  try {
    await new Promise((resolve, reject) => {
      const probe = spawn(candidate, ['--version'], {stdio: 'ignore'});
      probe.once('error', reject);
      probe.once('exit', (code) => (code === 0 ? resolve() : reject(new Error('exit ' + code))));
    });
    chromePath = candidate;
    break;
  } catch {
    // try next candidate
  }
}

if (!chromePath) {
  server.close();
  throw new Error('Headless Chromium is required for browser onboarding interaction checks.');
}

const dump = await new Promise((resolve, reject) => {
  const child = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--virtual-time-budget=15000',
    '--run-all-compositor-stages-before-draw',
    '--dump-dom',
    `http://127.0.0.1:${port}`,
  ], {stdio: ['ignore', 'pipe', 'pipe']});

  let stdout = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', () => {});
  child.once('error', reject);
  child.once('close', (code) => {
    if (code !== 0) reject(new Error('Chromium exited with code ' + code));
    else resolve(stdout);
  });
});

server.close();

const match = dump.match(/data-test-result="([^"]+)"/);
assert.ok(match, 'Browser interaction harness must expose data-test-result');
const payload = JSON.parse(match[1].replace(/&quot;/g, '"'));
assert.equal(payload.ok, true, payload.error || 'Browser interaction harness failed');

assert.equal(payload.pickerCalls, 2, 'Expected two cumulative native picker passes');
assert.equal(payload.submissions.length, 2, 'Expected failure followed by one retry');
assert.deepEqual(payload.submissions[0].folders, [projects.third.repoRoot], 'Removed and duplicate projects must not be submitted');
assert.equal(payload.submissions[0].autoTrack, false, 'NO must apply to the shared tracker submission');
assert.equal(payload.submissions[0].companionView, 'pet', 'Companion choice must be preserved in submission');
assert.deepEqual(payload.submissions[1].folders, [], 'Retry must not re-register projects saved by the failed tracker start');
assert.equal(payload.count, '2 ADDED');
assert.equal(payload.companion, 'pet');
assert.equal(payload.status, 'setup:complete');

console.log('Browser onboarding interaction checks passed.');
