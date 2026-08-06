import fs from 'node:fs';
import path from 'node:path';
import {strict as assert} from 'node:assert';
import {fileURLToPath} from 'node:url';
import {createServer} from '../src/api.mjs';
import {renderCompanionWindow} from '../src/companion-window.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
}

const api = read('src/api.mjs');
const companion = read('src/companion-electron.mjs');
const controls = read('src/companion-controls.mjs');
const onboarding = read('src/onboarding-window.mjs');
const onboardingElectron = read('src/onboarding-electron.mjs');
const miniHtml = renderCompanionWindow('http://127.0.0.1:4747');

assert.doesNotMatch(api, /\/terminal|\/pet|pet-assets/, 'API must not expose terminal or pet routes');
assert.match(api, /\/companion/, 'API must serve the Mini companion route');

assert.doesNotMatch(companion, /pet|switchView|KITCODE_COMPANION_VIEW/, 'Companion Electron must be Mini-only');
assert.match(companion, /`\$\{apiBase\}\/companion`/, 'Connected Mini must load from the tracker origin');
assert.match(companion, /showInactive/, 'Mini window must show when ready');

assert.match(controls, /companion-hide/, 'Mini title bar must expose hide control');
assert.doesNotMatch(controls, /pet-hide|renderPetHideControl/, 'Companion controls must not include pet UI');

assert.match(miniHtml, /data-testid="companion-counter-bar"/, 'Mini HTML must expose the counter bar');
assert.match(miniHtml, /data-testid="mini-percent"/, 'Mini HTML must expose percent metric');
assert.match(miniHtml, /data-testid="companion-hide"/, 'Mini HTML must expose hide control');
assert.doesNotMatch(miniHtml, /companion-mode-pet|switchView|pet-toggle/, 'Mini must not expose view switcher UI');

assert.match(onboarding, /companionView = 'mini'/, 'Welcome submit must hardcode mini companion');
assert.doesNotMatch(onboarding, /data-testid="companion-pet"/, 'Welcome must not expose companion selection');
assert.match(onboardingElectron, /openCompanion\(\)/, 'Welcome must open the Mini companion after save');
assert.doesNotMatch(onboardingElectron, /KITCODE_COMPANION_VIEW/, 'Welcome must not pass companion view env');

const runtime = {state: {projects: {}, equalsLedger: {total_equals: 0, projects: {}, earned_tiers: []}, rewardSettings: {}}};
const app = createServer(runtime, 'test');
const server = app.listen(0);
const baseUrl = `http://127.0.0.1:${server.address().port}`;

try {
  const companionResponse = await fetch(`${baseUrl}/companion`);
  assert.equal(companionResponse.status, 200);
  assert.match(companionResponse.headers.get('content-type'), /^text\/html/);
  const companionHtml = await companionResponse.text();
  assert.match(companionHtml, /KITCODE/);
  assert.match(companionHtml, /\/api\/summary/);

  const terminalResponse = await fetch(`${baseUrl}/terminal`);
  assert.equal(terminalResponse.status, 404);

  const petResponse = await fetch(`${baseUrl}/pet`);
  assert.equal(petResponse.status, 404);
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

console.log('Companion window checks passed.');
