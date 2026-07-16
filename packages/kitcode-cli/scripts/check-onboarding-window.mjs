import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveSetupPlatform, setupPlatformTheme} from '../src/onboarding-platform.mjs';
import {renderOnboardingWindow} from '../src/onboarding-window.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const electron = read('src/onboarding-electron.mjs');
const preload = read('src/onboarding-preload.cjs');
const runtime = read('src/runtime.mjs');

const platforms = ['darwin', 'win32', 'linux'];

for (const platform of platforms) {
  const html = renderOnboardingWindow(platform);
  const theme = setupPlatformTheme(platform);
  const inlineScript = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

  assert.ok(inlineScript, platform + ': setup must contain its interaction script');
  assert.doesNotThrow(() => new Function(inlineScript), platform + ': interaction script must parse');
  assert.match(html, new RegExp(`data-platform="${platform}"`), platform + ': setup must bind data-platform');
  assert.match(html, new RegExp(`data-theme-marker="${theme.marker}"`), platform + ': setup must expose theme marker');
  assert.match(html, new RegExp(theme.chromeClass.replace(' ', '\\s+')), platform + ': setup must use platform chrome');

  for (const token of ['--bg', '--panel', '--line', '--line-strong', '--primary', '--primary-strong', '--text', '--muted']) {
    assert.match(html, new RegExp(token), platform + ': setup must define semantic token ' + token);
  }

  assert.match(html, /<footer class="statusline/, platform + ': setup must expose a status line');
  assert.match(html, /role="radiogroup" aria-label="Start tracking after setup"/, platform + ': auto-track must be one accessible radio group');
  assert.match(html, /data-testid="auto-track-yes"/, platform + ': YES must have a stable selector');
  assert.match(html, /data-testid="auto-track-no"/, platform + ': NO must have a stable selector');
  assert.match(html, /data-testid="companion-pet"/, platform + ': companion selection must have a stable selector');
  assert.match(html, /remove-pending-project/, platform + ': pending removal must have a stable selector');
  assert.match(html, /option-mark/, platform + ': options must use platform radio marks');
  assert.match(html, /ArrowDown/, platform + ': option groups must handle down-arrow focus');
  assert.match(html, /ArrowUp/, platform + ': option groups must handle up-arrow focus');
  assert.match(html, /event\.key === ' '/, platform + ': option groups must handle Space selection');
  assert.match(html, /event\.key === 'Enter'/, platform + ': option groups must handle Enter selection');
  assert.match(html, /input:focus-visible \+ \.option-card/, platform + ': focused and selected states must be visibly distinct');
  assert.match(html, /pendingProjects\.push/, platform + ': repeated picker passes must append pending projects');
  assert.match(html, /knownProjectIds/, platform + ': project selection must deduplicate known identities');
  assert.match(html, /data-kind="pending"/, platform + ': project rows must distinguish pending projects');
  assert.match(html, /text-overflow: ellipsis/, platform + ': long project paths must not overflow');
  assert.match(html, /overflow: auto/, platform + ': the project collection must remain bounded and scrollable');
  assert.match(html, /Retry save/, platform + ': tracker or submission failure must offer retry');
  assert.match(html, /error:preload/, platform + ': setup must expose a preload failure state');
  assert.match(html, /setup:complete/, platform + ': setup must expose a success state');
  assert.match(html, /pendingProjects = pendingProjects\.filter/, platform + ': pending removal must only update pending UI state');
}

assert.match(electron, /resolveSetupPlatform\(\)/, 'Electron host must resolve setup platform');
assert.match(electron, /renderOnboardingWindow\(platform\)/, 'Electron host must pass platform into renderer');
assert.match(electron, /show: false/, 'Setup must defer visibility until content is ready');
assert.match(electron, /readyToShow/, 'Setup must wait for ready-to-show before revealing');
assert.match(electron, /contentLoaded/, 'Setup must wait for did-finish-load before revealing');
assert.match(electron, /app\.dock\?\.hide\(\)/, 'macOS setup must hide the dock icon until the window is ready');
assert.match(electron, /app\.dock\?\.show\(\)/, 'macOS setup must restore the dock icon when revealing');
assert.match(electron, /KITCODE_NO_OPEN/, 'Setup subprocesses must not auto-open terminal surfaces');
assert.match(electron, /detached: true/, 'Setup subprocesses must detach to avoid console flashes');
assert.match(electron, /requestSingleInstanceLock/, 'Setup must allow only one Welcome window at a time');
assert.match(electron, /second-instance/, 'Setup must focus the existing Welcome window on duplicate launch');
assert.match(electron, /loadOnboardingContent\(window, platform\)/, 'Electron host must load onboarding content through a stable file URL when possible');
assert.match(electron, /loadFile\(onboardingHtmlPath\(platform\)\)/, 'Electron host must prefer a cached welcome file for preload reliability');
assert.match(electron, /process\.exit\(0\)/, 'Duplicate setup launches must exit before showing a stray Electron window');
assert.match(electron, /preload-error/, 'Setup must log preload failures');
assert.match(electron, /titleBarStyle: 'hiddenInset'/, 'macOS setup must use hidden inset title bar');
assert.match(electron, /projects: listProjectRecords\(\)/, 'Initial state must include registered projects');
assert.match(electron, /registerNewProjects\(folders\)/, 'Submission must register only new project identities');
assert.match(electron, /!folders\.length && !listProjectRecords\(\)\.length/, 'Existing projects must allow preferences-only save');
assert.match(electron, /projects: describeProjects\(paths\)/, 'Folder picker must return detected project identities');
assert.match(electron, /completed: false/, 'Tracker failure must remain recoverable');
assert.match(preload, /kitcode:onboarding-close/, 'Frameless setup must expose an allowlisted close action');
assert.match(runtime, /export function registerNewProjects/, 'Runtime must own safe new-project registration');

assert.equal(resolveSetupPlatform('darwin'), 'darwin');
assert.equal(resolveSetupPlatform('win32'), 'win32');
assert.equal(resolveSetupPlatform('linux'), 'linux');
assert.equal(resolveSetupPlatform('freebsd'), 'linux');

console.log('Platform-native onboarding window checks passed.');
