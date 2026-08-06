import {app, BrowserWindow, ipcMain, nativeTheme, screen, shell} from 'electron';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderCompanionWindow} from './companion-window.mjs';
import {resolveDashboardUrl} from './open-dashboard.mjs';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.KITCODE_HOST ?? '127.0.0.1';
const port = process.env.KITCODE_PORT ?? '4747';
const apiBase = `http://${host}:${port}`;
const companionPreload = path.join(sourceDirectory, 'companion-preload.cjs');
const miniWidth = 560;
const miniHeight = 76;

let miniWindow;
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

function createMiniWindow(url) {
  const position = miniPosition();
  miniWindow = new BrowserWindow({
    width: miniWidth, height: miniHeight,
    minWidth: miniWidth, minHeight: miniHeight, maxWidth: miniWidth, maxHeight: miniHeight,
    x: position.x, y: position.y, frame: false, transparent: true, hasShadow: false,
    backgroundColor: '#00000000', resizable: false,
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
  createMiniWindow(miniUrl);
  ipcMain.handle('kitcode:companion-hide', (event) => {
    if (event.sender === miniWindow.webContents) app.quit();
    return {hidden: true};
  });
  ipcMain.handle('kitcode:open-dashboard', (event) => {
    if (event.sender !== miniWindow.webContents) {
      return {opened: false};
    }

    shell.openExternal(resolveDashboardUrl());
    return {opened: true};
  });
  miniWindow.once('ready-to-show', () => miniWindow.showInactive());
});

app.on('before-quit', () => {
  quitting = true;
  ipcMain.removeHandler('kitcode:companion-hide');
  ipcMain.removeHandler('kitcode:open-dashboard');
});
