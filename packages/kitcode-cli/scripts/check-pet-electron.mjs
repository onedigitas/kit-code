import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {app, BrowserWindow, screen} from 'electron';
import {createServer} from '../src/api.mjs';
import {createPetController} from '../src/pet-electron.mjs';
import {
  PET_HEIGHT,
  PET_WIDTH,
} from '../src/pet-motion.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(scriptDirectory, '../src');
const terminalPreloadPath = path.join(sourceDirectory, 'terminal-preload.cjs');
const petPreloadPath = path.join(sourceDirectory, 'pet-preload.cjs');
const resultArgument = process.argv.find((argument) => argument.startsWith('--result='));
const resultPath = resultArgument ? resultArgument.slice('--result='.length) : null;

function writeResult(payload) {
  if (resultPath) {
    fs.writeFileSync(resultPath, `${JSON.stringify(payload, null, 2)}\n`);
  }
}

const runtime = {
  options: {rewardSeconds: 3600, rewardEquals: 100},
  projectRuns: new Map(),
  state: {projects: {}},
};

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitFor(predicate, message, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await wait(40);
  }
  throw new Error(message);
}

function assertInsideWorkArea(bounds, workArea) {
  assert.ok(bounds.x >= workArea.x);
  assert.ok(bounds.y >= workArea.y);
  assert.ok(bounds.x + bounds.width <= workArea.x + workArea.width);
  assert.ok(bounds.y + bounds.height <= workArea.y + workArea.height);
}

const readyWatchdog = setTimeout(() => {
  console.error('Electron app.ready timed out');
  writeResult({ok: false, stage: 'app-ready', error: 'Electron app.ready timed out'});
  app.exit(2);
}, 15000);
await app.whenReady();
clearTimeout(readyWatchdog);
app.dock?.hide();
Math.random = () => 0;

const server = createServer(runtime, 'electron-verification').listen(0, '127.0.0.1');
await new Promise((resolve, reject) => {
  server.once('listening', resolve);
  server.once('error', reject);
});

const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const ownerWindow = new BrowserWindow({
  width: 800,
  height: 600,
  show: false,
  webPreferences: {
    preload: terminalPreloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  },
});
const controller = createPetController({
  ownerWindow,
  petUrl: `${baseUrl}/pet`,
  preloadPath: petPreloadPath,
});
ownerWindow.once('closed', () => controller.destroy());

let failed = false;
try {
  await ownerWindow.loadURL(`${baseUrl}/terminal`);
  assert.deepEqual(
    await ownerWindow.webContents.executeJavaScript('window.kitcodeTerminal.getPetVisible()'),
    {visible: false},
  );

  assert.deepEqual(
    await ownerWindow.webContents.executeJavaScript('window.kitcodeTerminal.setPetVisible(true)'),
    {visible: true},
  );
  await waitFor(() => BrowserWindow.getAllWindows().length === 2, 'pet window was not created');
  const petWindow = BrowserWindow.getAllWindows().find((window) => window !== ownerWindow);
  await waitFor(() => !petWindow.webContents.isLoading(), 'pet renderer did not finish loading');
  await waitFor(() => petWindow.isVisible(), 'pet window did not become visible');

  assert.equal(petWindow.getTitle(), 'KitCode Pet');
  assert.deepEqual(petWindow.getSize(), [PET_WIDTH, PET_HEIGHT]);
  assert.equal(petWindow.isAlwaysOnTop(), true);
  assert.equal(petWindow.isResizable(), false);
  assert.equal(petWindow.isMinimizable(), false);
  assert.equal(petWindow.isMaximizable(), false);
  assert.equal(petWindow.isMovable(), true);
  assert.equal(petWindow.isFocusable(), false);
  assert.equal(petWindow.hasShadow(), false);
  assert.equal(petWindow.getBackgroundColor(), '#00000000');
  assertInsideWorkArea(petWindow.getBounds(), screen.getDisplayMatching(petWindow.getBounds()).workArea);

  await waitFor(async () => (
    await ownerWindow.webContents.executeJavaScript(
      'document.querySelector("[data-testid=pet-toggle]").getAttribute("aria-pressed")',
    )
  ) === 'true', 'Terminal toggle did not synchronize to ON');

  await wait(1250);
  const restingFrom = petWindow.getPosition();
  await wait(240);
  assert.deepEqual(petWindow.getPosition(), restingFrom, 'visible pet should stay where it was placed');

  const draggedTo = [
    Math.max(screen.getPrimaryDisplay().workArea.x, restingFrom[0] - 24),
    Math.max(screen.getPrimaryDisplay().workArea.y, restingFrom[1] - 12),
  ];
  const startPointer = {x: restingFrom[0] + Math.round(PET_WIDTH / 2), y: restingFrom[1] + Math.round(160 * 0.65)};
  const endPointer = {
    x: startPointer.x + draggedTo[0] - restingFrom[0],
    y: startPointer.y + draggedTo[1] - restingFrom[1],
  };
  await petWindow.webContents.executeJavaScript(
    `window.kitcodePet.dragStart(${JSON.stringify(startPointer)})`,
  );
  await petWindow.webContents.executeJavaScript(
    `window.kitcodePet.dragMove(${JSON.stringify(endPointer)})`,
  );
  await waitFor(() => {
    const [x, y] = petWindow.getPosition();
    return x === draggedTo[0] && y === draggedTo[1];
  }, 'pet did not accept drag placement');
  await waitFor(async () => (
    await petWindow.webContents.executeJavaScript('document.body.dataset.animation')
  ) === 'walking-left', 'left drag animation did not start');
  const rightPointer = {x: endPointer.x + 28, y: endPointer.y};
  await petWindow.webContents.executeJavaScript(
    `window.kitcodePet.dragMove(${JSON.stringify(rightPointer)})`,
  );
  await waitFor(async () => (
    await petWindow.webContents.executeJavaScript('document.body.dataset.animation')
  ) === 'walking-right', 'right drag animation did not start');
  await petWindow.webContents.executeJavaScript('window.kitcodePet.dragEnd()');
  await wait(520);
  const droppedPosition = petWindow.getPosition();
  assert.equal(
    await petWindow.webContents.executeJavaScript('document.body.dataset.animation'),
    'idle',
  );
  assert.deepEqual(petWindow.getPosition(), droppedPosition, 'dropped pet should stay pinned at the release position');

  await petWindow.webContents.executeJavaScript('window.kitcodePet.click()');
  await waitFor(async () => (
    await petWindow.webContents.executeJavaScript('document.body.dataset.animation')
  ) === 'jumping', 'click animation did not jump');
  await wait(820);
  assert.equal(
    await petWindow.webContents.executeJavaScript('document.body.dataset.animation'),
    'idle',
  );

  const instanceId = petWindow.id;
  assert.deepEqual(
    await ownerWindow.webContents.executeJavaScript('window.kitcodeTerminal.setPetVisible(false)'),
    {visible: false},
  );
  await waitFor(() => !petWindow.isVisible(), 'pet window did not hide');
  const hiddenPosition = petWindow.getPosition();
  await wait(180);
  assert.deepEqual(petWindow.getPosition(), hiddenPosition, 'hidden pet should stay pinned');

  assert.deepEqual(
    await ownerWindow.webContents.executeJavaScript('window.kitcodeTerminal.setPetVisible(true)'),
    {visible: true},
  );
  await waitFor(() => petWindow.isVisible(), 'pet window did not show again');
  assert.equal(BrowserWindow.getAllWindows().find((window) => window !== ownerWindow).id, instanceId);
  const resumedPosition = petWindow.getPosition();
  assert.ok(Math.hypot(
    resumedPosition[0] - hiddenPosition[0],
    resumedPosition[1] - hiddenPosition[1],
  ) <= 6, 'pet did not resume from its session position');

  ownerWindow.destroy();
  await waitFor(() => petWindow.isDestroyed(), 'pet window survived owner shutdown');
  assert.equal(BrowserWindow.getAllWindows().length, 0);
  writeResult({ok: true, stage: 'complete'});
  console.log('Pet Electron checks passed.');
} catch (error) {
  failed = true;
  writeResult({ok: false, stage: 'checks', error: error.stack ?? String(error)});
  console.error(error);
} finally {
  controller.destroy();
  if (!ownerWindow.isDestroyed()) ownerWindow.destroy();
  await new Promise((resolve) => server.close(resolve));
  app.quit();
}

if (failed) process.exitCode = 1;
