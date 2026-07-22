import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveSetupPlatform, setupPlatformTheme} from '../src/onboarding-platform.mjs';
import {renderOnboardingWindow} from '../src/onboarding-window.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const electron = read('src/onboarding-electron.mjs');
const cli = read('bin/kitcode.mjs');
const preload = read('src/onboarding-preload.cjs');
const runtime = read('src/runtime.mjs');

const platforms = ['darwin', 'win32', 'linux'];
const chromeByPlatform = {
  darwin: 'chrome-macos',
  win32: 'chrome-windows',
  linux: 'chrome-linux',
};

for (const platform of platforms) {
  const html = renderOnboardingWindow(platform);
  const theme = setupPlatformTheme(platform);
  const inlineScript = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

  assert.ok(inlineScript, platform + ': setup must contain its interaction script');
  assert.doesNotThrow(() => new Function(inlineScript), platform + ': interaction script must parse');
  assert.match(html, new RegExp(`data-platform="${platform}"`), platform + ': setup must bind data-platform');
  assert.match(html, new RegExp(`data-theme-marker="${theme.marker}"`), platform + ': setup must expose theme marker');
  assert.match(html, new RegExp(chromeByPlatform[platform]), platform + ': setup must use platform chrome');

  for (const token of ['--bg', '--panel', '--line', '--line-strong', '--primary', '--primary-strong', '--text', '--muted']) {
    assert.match(html, new RegExp(token), platform + ': setup must define semantic token ' + token);
  }

  assert.match(html, /#000000/, platform + ': setup must use the shared gateway palette');
  assert.match(html, /#f2f0ea/, platform + ': setup must use gateway cream text');
  assert.match(html, /Departure Mono/, platform + ': setup must use the gateway monospace stack');
  assert.match(html, /JetBrains Mono/, platform + ': setup must include JetBrains Mono in the gateway stack');
  assert.match(html, /ui-monospace/, platform + ': setup must keep ui-monospace as a gateway fallback');
  assert.match(html, /KITCODE SETUP/, platform + ': setup must keep the reference header title');
  assert.match(html, /data-testid="setup-step-rail"/, platform + ': setup must expose the step rail');
  assert.match(html, /data-setup-step="tracking"/, platform + ': setup must tag the tracking section');
  assert.match(html, /data-setup-step="projects"/, platform + ': setup must tag the projects section');
  assert.match(html, /data-setup-step="companion"/, platform + ': setup must tag the companion section');
  assert.match(html, /IntersectionObserver/, platform + ': setup must spy active sections for the rail');
  assert.match(html, /class="project-list is-empty"/, platform + ': setup must start with a dashed empty project zone');
  assert.match(html, /No projects added/, platform + ': setup must use the reference empty-state copy');
  assert.match(html, /section-divider/, platform + ': setup must separate sections with full-width dividers');
  assert.match(html, /content-footer/, platform + ': setup must expose a main content footer');
  assert.match(html, /class="steps-panel"/, platform + ': setup must isolate step rail from footer');
  assert.match(html, /Save &amp; Open KitCode &rarr;/, platform + ': setup must use the reference CTA copy');
  assert.match(html, /grid-template-columns: 168px/, platform + ': setup must use a wider step rail');
  assert.doesNotMatch(html, /Hello, KitCoder/, platform + ': setup must remove the old intro eyebrow');
  assert.match(html, /NORMAL/, platform + ': setup must keep the terminal statusline');
  assert.match(html, /\[x\]/, platform + ': setup must keep terminal option marks');
  assert.match(html, /<footer class="statusline/, platform + ': setup must expose a status line');
  assert.match(html, /role="radiogroup" aria-label="Start tracking after setup"/, platform + ': auto-track must be one accessible radio group');
  assert.match(html, /data-testid="auto-track-yes"/, platform + ': YES must have a stable selector');
  assert.match(html, /data-testid="auto-track-no"/, platform + ': NO must have a stable selector');
  assert.match(html, /data-testid="companion-pet"/, platform + ': companion selection must have a stable selector');
  assert.match(html, /dataset\.testid = 'remove-project'/, platform + ': project removal must have a stable selector');
  assert.match(html, /option-mark/, platform + ': options must use option marks');
  assert.match(html, /ArrowDown/, platform + ': option groups must handle down-arrow focus');
  assert.match(html, /ArrowUp/, platform + ': option groups must handle up-arrow focus');
  assert.match(html, /event\.key === ' '/, platform + ': option groups must handle Space selection');
  assert.match(html, /event\.key === 'Enter'/, platform + ': option groups must handle Enter selection');
  assert.match(html, /input:focus-visible \+ \.option-card/, platform + ': focused and selected states must be visibly distinct');
  assert.match(html, /state\.suggestedProjects/, platform + ': setup must seed pending projects from chat context');
  assert.match(html, /projects:chat-suggested/, platform + ': setup must expose chat-suggested feedback');
  assert.match(html, /pendingProjects\.push/, platform + ': repeated picker passes must append pending projects');
  assert.match(html, /knownProjectIds/, platform + ': project selection must deduplicate known identities');
  assert.match(html, /data-kind="pending"/, platform + ': project rows must distinguish pending projects');
  assert.match(html, /text-overflow: ellipsis/, platform + ': long project paths must not overflow');
  assert.match(html, /overflow: auto/, platform + ': the project collection must remain bounded and scrollable');
  assert.match(html, /Retry save/i, platform + ': tracker or submission failure must offer retry');
  assert.match(html, /error:preload/, platform + ': setup must expose a preload failure state');
  assert.match(html, /setup:complete/, platform + ': setup must expose a success state');
  assert.match(html, /pendingProjects = pendingProjects\.filter/, platform + ': pending removal must only update pending UI state');
  assert.match(html, /bridge\.removeProject/, platform + ': tracked removal must call the onboarding bridge');
  assert.doesNotMatch(html, /Segoe UI|Cantarell|SF Pro Text/, platform + ': body must not use per-OS native fonts');
  assert.doesNotMatch(html, /#050705|#0b0f0c/, platform + ': setup must leave the old green-terminal ground behind');
}

assert.match(renderOnboardingWindow('darwin'), /chrome-macos/, 'macOS chrome must use the macOS header class');
assert.match(renderOnboardingWindow('darwin'), /close-button-macos/, 'macOS chrome must keep a close hit target over native traffic lights');
assert.doesNotMatch(renderOnboardingWindow('darwin'), /class="[^"]*traffic-light/, 'macOS chrome must not draw HTML traffic lights on top of native ones');
assert.match(renderOnboardingWindow('darwin'), /padding: 0 14px 0 78px/, 'macOS chrome must pad left of the tab for native traffic lights');
assert.match(renderOnboardingWindow('win32'), /window-controls-windows/, 'Windows chrome must use right window controls');
assert.match(renderOnboardingWindow('win32'), /close-button-windows/, 'Windows chrome must expose a right-side close control');
assert.doesNotMatch(renderOnboardingWindow('win32'), /class="[^"]*traffic-light/, 'Windows chrome must not use macOS traffic lights');
assert.match(renderOnboardingWindow('linux'), /close-button-linux/, 'Linux chrome must use Linux-style close control');
assert.doesNotMatch(renderOnboardingWindow('linux'), /class="[^"]*window-controls-windows|class="[^"]*traffic-light/, 'Linux chrome must not use Windows or macOS control clusters');
assert.match(renderOnboardingWindow('linux'), /padding: 0 4px 0 14px/, 'Linux chrome must keep right padding for the close control');
assert.doesNotMatch(renderOnboardingWindow('darwin'), /body\[data-platform="darwin"\] \.option-card/, 'body styling must not branch per OS');

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
assert.match(electron, /trafficLightPosition: \{x: 16, y: 13\}/, 'macOS setup must inset native traffic lights with header padding');
assert.match(electron, /backgroundColor: '#000000'/, 'Setup window must use the shared gateway background');
assert.match(electron, /projects: listProjectRecords\(\)/, 'Initial state must include registered projects');
assert.match(electron, /suggestedProjects: initialSuggestedProjects\(\)/, 'Initial state must include chat-suggested projects');
assert.match(electron, /resolveInitialProjectSuggestion/, 'Electron host must resolve chat project suggestions');
assert.match(electron, /KITCODE_INITIAL_PROJECT/, 'Electron host must read the initial project env var');
assert.match(electron, /registerNewProjects\(folders\)/, 'Submission must register only new project identities');
assert.match(electron, /!folders\.length && !listProjectRecords\(\)\.length/, 'Existing projects must allow preferences-only save');
assert.match(electron, /projects: describeProjects\(paths\)/, 'Folder picker must return detected project identities');
assert.match(electron, /completed: false/, 'Tracker failure must remain recoverable');
assert.match(electron, /kitcode:onboarding-remove-project/, 'Electron host must expose project removal during setup');
assert.match(preload, /kitcode:onboarding-close/, 'Frameless setup must expose an allowlisted close action');
assert.match(preload, /kitcode:onboarding-remove-project/, 'Setup preload must expose project removal');
assert.match(runtime, /export function registerNewProjects/, 'Runtime must own safe new-project registration');

assert.equal(resolveSetupPlatform('darwin'), 'darwin');
assert.equal(resolveSetupPlatform('macos'), 'darwin');
assert.equal(resolveSetupPlatform('win32'), 'win32');
assert.equal(resolveSetupPlatform('windows'), 'win32');
assert.equal(resolveSetupPlatform('linux'), 'linux');
assert.equal(resolveSetupPlatform('freebsd'), 'linux');

assert.match(electron, /KITCODE_SETUP_PLATFORM \|\| process\.platform/, 'Setup must honor KITCODE_SETUP_PLATFORM overrides for chrome preview');
assert.match(cli, /--platform/, 'CLI must expose --platform for Welcome chrome preview');
assert.match(cli, /KITCODE_SETUP_PLATFORM/, 'CLI must pass --platform into Welcome as KITCODE_SETUP_PLATFORM');

console.log('Gateway-aligned Welcome chrome-only platform checks passed.');
