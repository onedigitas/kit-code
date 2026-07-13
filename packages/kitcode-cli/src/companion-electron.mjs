import {app, BrowserWindow, ipcMain, nativeTheme, screen} from 'electron';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPetController} from './pet-electron.mjs';
import {renderCompanionWindow} from './companion-window.mjs';
import {renderPetWindow} from './pet-window.mjs';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.KITCODE_HOST ?? '127.0.0.1';
const port = process.env.KITCODE_PORT ?? '4747';
const initialView = process.env.KITCODE_COMPANION_VIEW === 'pet' ? 'pet' : 'mini';
const apiBase = `http://${host}:${port}`;
const companionPreload = path.join(sourceDirectory, 'companion-preload.cjs');
const petPreload = path.join(sourceDirectory, 'pet-preload.cjs');
const miniWidth = 320;
const miniHeight = 110;

let miniWindow;
let petController;
let activeView = initialView;
let quitting = false;

function miniPosition() {
  const {workArea} = screen.getPrimaryDisplay();
  return {
    x: workArea.x + workArea.width - miniWidth - 28,
    y: workArea.y + workArea.height - miniHeight - 72,
  };
}

async function trackerReady() {
  try {
    const response = await fetch(`${apiBase}/api/health`, {signal: AbortSignal.timeout(1200)});
    const health = response.ok ? await response.json() : null;
    return health?.status === 'ok' && health?.app === 'kitcode';
  } catch {
    return false;
  }
}

function showView(view) {
  activeView = view === 'pet' ? 'pet' : 'mini';
  if (activeView === 'pet') {
    miniWindow.hide();
    petController.setVisible(true);
    return {view: activeView};
  }

  petController.setVisible(false);
  miniWindow.showInactive();
  return {view: activeView};
}

function createMiniWindow(url) {
  const position = miniPosition();
  miniWindow = new BrowserWindow({
    width: miniWidth, height: miniHeight,
    minWidth: miniWidth, minHeight: miniHeight, maxWidth: miniWidth, maxHeight: miniHeight,
    x: position.x, y: position.y, frame: false, transparent: true, resizable: false,
    movable: true, alwaysOnTop: true, skipTaskbar: true, show: false,
    webPreferences: {preload: companionPreload, contextIsolation: true, nodeIntegration: false, sandbox: true},
  });
  miniWindow.setAlwaysOnTop(true, 'floating');
  miniWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  miniWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      app.quit();
    }
  });
  miniWindow.loadURL(url);
}

app.whenReady().then(async () => {
  nativeTheme.themeSource = 'dark';
  const connected = await trackerReady();
  const miniUrl = connected
    ? `${apiBase}/companion`
    : `data:text/html;charset=utf-8,${encodeURIComponent(renderCompanionWindow(apiBase))}`;
  const petUrl = connected
    ? `${apiBase}/pet`
    : `data:text/html;charset=utf-8,${encodeURIComponent(renderPetWindow(apiBase))}`;
  createMiniWindow(miniUrl);
  petController = createPetController({
    ownerWindow: miniWindow,
    petUrl,
    preloadPath: petPreload,
    ipcChannelPrefix: 'kitcode-companion',
    onSwitchToMini: () => showView('mini'),
    onHide: () => app.quit(),
  });
  ipcMain.handle('kitcode:companion-switch-view', (event, view) => event.sender === miniWindow.webContents ? showView(view) : {view: activeView});
  ipcMain.handle('kitcode:companion-hide', (event) => {
    if (event.sender === miniWindow.webContents) app.quit();
    return {hidden: true};
  });
  miniWindow.once('ready-to-show', () => showView(initialView));
});

app.on('before-quit', () => {
  quitting = true;
  petController?.destroy();
  ipcMain.removeHandler('kitcode:companion-switch-view');
  ipcMain.removeHandler('kitcode:companion-hide');
});
