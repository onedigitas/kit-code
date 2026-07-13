import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderOnboardingWindow} from '../src/onboarding-window.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = renderOnboardingWindow();
const electron = read('src/onboarding-electron.mjs');
const preload = read('src/onboarding-preload.cjs');
const runtime = read('src/runtime.mjs');
const inlineScript = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

assert.ok(inlineScript, 'Setup must contain its interaction script');
assert.doesNotThrow(() => new Function(inlineScript), 'Rendered Setup interaction script must parse');

for (const token of ['--bg', '--panel', '--line', '--line-strong', '--primary', '--primary-strong', '--text', '--muted']) {
  assert.match(html, new RegExp(token), 'Setup must reuse Terminal semantic token ' + token);
}

assert.match(html, /class="chrome"/, 'Setup must use frameless Terminal chrome');
assert.match(html, /class="statusline"/, 'Setup must use a Vim-style status line');
assert.match(html, />NORMAL</, 'Setup status line must expose NORMAL mode');
assert.match(html, /role="radiogroup" aria-label="Start tracking after setup"/, 'Auto-track must be one accessible radio group');
assert.match(html, /data-testid="auto-track-yes"/, 'YES must have a stable selector');
assert.match(html, /data-testid="auto-track-no"/, 'NO must have a stable selector');
assert.match(html, /data-testid="companion-pet"/, 'Companion selection must have a stable selector');
assert.match(html, /remove-pending-project/, 'Pending removal must have a stable selector');
assert.match(html, /\[x\]/, 'Selected options must use terminal checkbox notation');
assert.match(html, /ArrowDown/, 'Option groups must handle down-arrow focus');
assert.match(html, /ArrowUp/, 'Option groups must handle up-arrow focus');
assert.match(html, /event\.key === ' '/, 'Option groups must handle Space selection');
assert.match(html, /event\.key === 'Enter'/, 'Option groups must handle Enter selection');
assert.match(html, /input:focus-visible \+ \.option-card/, 'Focused and selected states must be visibly distinct');
assert.match(html, /pendingProjects\.push/, 'Repeated picker passes must append pending projects');
assert.match(html, /knownProjectIds/, 'Project selection must deduplicate known identities');
assert.match(html, /data-kind="pending"/, 'Project rows must distinguish pending projects');
assert.match(html, /text-overflow: ellipsis/, 'Long project paths must not overflow');
assert.match(html, /overflow: auto/, 'The project collection must remain bounded and scrollable');
assert.match(html, /RETRY SAVE/, 'Tracker or submission failure must offer retry');
assert.match(html, /setup:complete/, 'Setup must expose a success state');
assert.match(html, /pendingProjects = pendingProjects\.filter/, 'Pending removal must only update pending UI state');

assert.match(electron, /projects: listProjectRecords\(\)/, 'Initial state must include registered projects');
assert.match(electron, /registerNewProjects\(folders\)/, 'Submission must register only new project identities');
assert.match(electron, /!folders\.length && !listProjectRecords\(\)\.length/, 'Existing projects must allow preferences-only save');
assert.match(electron, /projects: describeProjects\(paths\)/, 'Folder picker must return detected project identities');
assert.match(electron, /completed: false/, 'Tracker failure must remain recoverable');
assert.match(preload, /kitcode:onboarding-close/, 'Frameless Setup must expose an allowlisted close action');
assert.match(runtime, /export function registerNewProjects/, 'Runtime must own safe new-project registration');

console.log('Terminal-style onboarding window checks passed.');
