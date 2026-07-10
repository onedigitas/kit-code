import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  effectivePetAnimation,
  PET_ANIMATIONS,
  PET_ATLAS,
  petAnimationForSummary,
} from '../src/pet-animations.mjs';
import {renderPetWindow} from '../src/pet-window.mjs';
import {renderTerminalWindow} from '../src/terminal-window.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readSource = (relativePath) => fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
const apiSource = readSource('src/api.mjs');
const petElectronSource = readSource('src/pet-electron.mjs');
const petPreloadSource = readSource('src/pet-preload.cjs');
const terminalElectronSource = readSource('src/terminal-electron.mjs');
const terminalPreloadSource = readSource('src/terminal-preload.cjs');
const terminalHtml = renderTerminalWindow();
const petHtml = renderPetWindow();

assert.equal(PET_ATLAS.spriteVersionNumber, 2);
assert.equal(PET_ATLAS.width, 1536);
assert.equal(PET_ATLAS.height, 2288);
assert.equal(PET_ATLAS.cellWidth, 192);
assert.equal(PET_ATLAS.cellHeight, 208);
for (const state of ['idle', 'walking-right', 'walking-left', 'waving', 'jumping', 'failed', 'waiting', 'working', 'blink', 'review']) {
  assert.ok(PET_ANIMATIONS[state], `Missing pet animation ${state}`);
}
assert.equal(PET_ANIMATIONS.idle.row, 0);
assert.equal(PET_ANIMATIONS['walking-right'].row, 1);
assert.equal(PET_ANIMATIONS['walking-left'].row, 2);
assert.equal(PET_ANIMATIONS.waving.row, 3);
assert.equal(PET_ANIMATIONS.jumping.row, 4);
assert.equal(PET_ANIMATIONS.failed.row, 5);
assert.equal(PET_ANIMATIONS.waiting.row, 6);
assert.equal(PET_ANIMATIONS.working.row, 7);
assert.equal(PET_ANIMATIONS.blink.row, 8);
assert.equal(petAnimationForSummary({global: {trackingProjects: 0}, reward: {tiers: []}}), 'idle');
assert.equal(petAnimationForSummary({global: {trackingProjects: 1}, reward: {tiers: []}}), 'idle');
assert.equal(petAnimationForSummary({
  global: {trackingProjects: 1},
  reward: {tiers: [{status: 'ready'}]},
}), 'idle');
assert.equal(petAnimationForSummary(null, 'offline'), 'failed');
assert.equal(petAnimationForSummary(null, 'reconnecting'), 'waiting');
assert.equal(effectivePetAnimation('idle', 'walking-left'), 'walking-left');
assert.equal(effectivePetAnimation('jumping', 'walking-left'), 'walking-left');
assert.equal(effectivePetAnimation('failed', 'waving'), 'waving');
assert.equal(effectivePetAnimation('idle', 'jumping'), 'jumping');
assert.equal(effectivePetAnimation('idle', 'working'), 'working');
assert.equal(effectivePetAnimation('idle', 'review'), 'review');

assert.match(apiSource, /renderPetWindow/);
assert.match(apiSource, /app\.get\('\/pet'/);
assert.match(apiSource, /pet-assets\/kit-terminal\/spritesheet\.webp/);

assert.match(terminalElectronSource, /createPetController/);
assert.match(terminalElectronSource, /ownerWindow: window/);
assert.match(terminalElectronSource, /petController\.destroy\(\)/);

assert.match(terminalPreloadSource, /kitcode:set-pet-visible/);
assert.match(terminalPreloadSource, /kitcode:get-pet-visible/);
assert.match(terminalPreloadSource, /kitcode:pet:terminal-action/);
assert.match(terminalPreloadSource, /triggerPetAction/);
assert.match(terminalPreloadSource, /allowedPetActions/);
assert.match(terminalPreloadSource, /kitcode:pet:visibility/);
assert.doesNotMatch(terminalPreloadSource, /shell|child_process|\bfs\b/);

assert.match(terminalHtml, /id="petToggle"/);
assert.match(terminalHtml, /data-testid="pet-toggle"/);
assert.match(terminalHtml, /PET OFF/);
assert.match(terminalHtml, /aria-pressed="false"/);
assert.match(terminalHtml, /Desktop pet requires KitCode Terminal/);
assert.match(terminalHtml, /window\.kitcodeTerminal\.setPetVisible/);
assert.match(terminalHtml, /window\.kitcodeTerminal\.getPetVisible/);
assert.match(terminalHtml, /triggerPetAction\?\.\('review'\)/);
assert.match(terminalHtml, /onPetVisibilityChanged/);
assert.doesNotMatch(terminalHtml, /normalized === 'pet'/);
assert.doesNotMatch(terminalHtml, /kitcode pet/);

assert.match(petElectronSource, /new BrowserWindow/);
assert.match(petElectronSource, /width: PET_WIDTH/);
assert.match(petElectronSource, /height: PET_HEIGHT/);
assert.match(petElectronSource, /transparent: true/);
assert.match(petElectronSource, /frame: false/);
assert.match(petElectronSource, /backgroundColor: '#00000000'/);
assert.match(petElectronSource, /hasShadow: false/);
assert.match(petElectronSource, /resizable: false/);
assert.match(petElectronSource, /alwaysOnTop: true/);
assert.match(petElectronSource, /skipTaskbar: true/);
assert.match(petElectronSource, /focusable: false/);
assert.match(petElectronSource, /sandbox: true/);
assert.match(petElectronSource, /contextIsolation: true/);
assert.match(petElectronSource, /nodeIntegration: false/);
assert.match(petElectronSource, /setIgnoreMouseEvents\(false\)/);
assert.doesNotMatch(petElectronSource, /setIgnoreMouseEvents\(true, \{forward: true\}\)/);
assert.doesNotMatch(petElectronSource, /setIgnoreMouseEvents\(!interactive/);
assert.doesNotMatch(petElectronSource, /kitcode:pet:set-interactive/);
assert.match(petElectronSource, /kitcode:pet:drag-start/);
assert.match(petElectronSource, /kitcode:pet:drag-move/);
assert.match(petElectronSource, /kitcode:pet:drag-end/);
assert.match(petElectronSource, /kitcode:pet:click/);
assert.match(petElectronSource, /kitcode:pet:terminal-action/);
assert.match(petElectronSource, /kitcode:pet:action/);
assert.match(petElectronSource, /handleTerminalPetAction/);
assert.match(petElectronSource, /walking-left/);
assert.match(petElectronSource, /walking-right/);
assert.match(petElectronSource, /showTimedMotion\('jumping'/);
assert.match(petElectronSource, /showTimedMotion\('waving'/);
assert.match(petElectronSource, /CLICK_FEEDBACK_MS/);
assert.match(petElectronSource, /INTRO_WAVE_MS/);
assert.match(petElectronSource, /DROP_FEEDBACK_MS/);
assert.match(petElectronSource, /petWindow\.on\('moved'/);
assert.doesNotMatch(petElectronSource, /nextPetStep/);
assert.doesNotMatch(petElectronSource, /setInterval/);
assert.match(petElectronSource, /screen\.getDisplayMatching/);
assert.match(petElectronSource, /screen\.getDisplayNearestPoint/);
assert.match(petElectronSource, /screen\.on\('display-removed'/);
assert.match(petElectronSource, /screen\.on\('display-metrics-changed'/);
assert.match(petElectronSource, /if \(petWindow && !petWindow\.isDestroyed\(\)\)/);
assert.match(petElectronSource, /visible \? createWindow\(\) : petWindow/);
assert.match(petElectronSource, /window\.hide\(\)/);
assert.match(petElectronSource, /lastPosition/);
assert.doesNotMatch(petElectronSource, /\bapp\b|requestSingleInstanceLock|child_process|spawn\(/);

assert.match(petPreloadSource, /kitcode:pet:drag-start/);
assert.match(petPreloadSource, /kitcode:pet:drag-move/);
assert.match(petPreloadSource, /kitcode:pet:drag-end/);
assert.match(petPreloadSource, /kitcode:pet:click/);
assert.match(petPreloadSource, /kitcode:pet:action/);
assert.match(petPreloadSource, /kitcode:pet:motion-state/);
assert.match(petPreloadSource, /kitcode:pet:visibility-state/);
assert.doesNotMatch(petPreloadSource, /kitcode:pet:set-interactive/);
assert.doesNotMatch(petPreloadSource, /shell|child_process|\bfs\b/);

assert.match(petHtml, /--primary: #fc0a0a/);
assert.match(petHtml, /spritesheet\.webp/);
assert.match(petHtml, /id="petBubble"/);
assert.match(petHtml, /id="petBubbleMain"/);
assert.match(petHtml, /id="petBubbleMeta"/);
assert.match(petHtml, /aria-live="polite"/);
assert.match(petHtml, /Next milestone/);
assert.match(petHtml, /reward ready/);
assert.match(petHtml, /Waiting for progress/);
assert.match(petHtml, /= 0 · Work 0m/);
assert.match(petHtml, /function formatWorkTime/);
assert.match(petHtml, /function bubbleMetaForSummary/);
assert.match(petHtml, /function bubbleDetailForSummary/);
assert.match(petHtml, /function triggerTransientAnimation/);
assert.match(petHtml, /function handleSummaryAction/);
assert.match(petHtml, /function progressIncreased/);
assert.match(petHtml, /function readyTierPercents/);
assert.match(petHtml, /function unlockedMilestonePercents/);
assert.match(petHtml, /function updateBubble/);
assert.match(petHtml, /function bubbleStateForSummary/);
assert.match(petHtml, /reward\?\.milestones|summary\?\.reward\?\.milestones/);
assert.match(petHtml, /reward\.tiers/);
assert.match(petHtml, /reward\.totalEquals/);
assert.match(petHtml, /reward\.earnedSeconds/);
assert.match(petHtml, /bubbleMain\.textContent/);
assert.match(petHtml, /bubbleMeta\.textContent/);
assert.match(petHtml, /showBubbleDetail/);
assert.match(petHtml, /showActionBubble/);
assert.match(petHtml, /Reward unlocked/);
assert.match(petHtml, /Milestone reached/);
assert.match(petHtml, /Reviewing progress/);
assert.match(petHtml, /pointerenter/);
assert.match(petHtml, /workingActionCooldownMs/);
assert.match(petHtml, /hoverActionCooldownMs/);
assert.match(petHtml, /equals counted/);
assert.match(petHtml, /-webkit-app-region: no-drag/);
assert.doesNotMatch(petHtml, /-webkit-app-region: drag/);
assert.match(petHtml, /pointerdown/);
assert.match(petHtml, /pointermove/);
assert.match(petHtml, /pointerup/);
assert.match(petHtml, /dragThreshold/);
assert.match(petHtml, /dragStart/);
assert.match(petHtml, /dragMove/);
assert.match(petHtml, /dragEnd/);
assert.match(petHtml, /click/);
assert.doesNotMatch(petHtml, /getImageData\(x, y, 1, 1\)/);
assert.doesNotMatch(petHtml, /reportInteractive/);
assert.match(petHtml, /fetch\('\/api\/summary'/);
assert.match(petHtml, /new EventSource\('\/api\/events'\)/);
assert.doesNotMatch(petHtml, /baseAnimation = 'jumping'/);
assert.doesNotMatch(petHtml, /baseAnimation = 'working'/);
assert.match(petHtml, /transientAnimation = 'blink'/);
assert.match(petHtml, /stopBlinkTimers\(\)/);
assert.doesNotMatch(petHtml, /setInteractive/);
assert.doesNotMatch(petHtml, /child_process|spawn\(|exec\(/);
assert.doesNotMatch(petHtml, /localStorage|sessionStorage/);

console.log('Pet window checks passed.');
