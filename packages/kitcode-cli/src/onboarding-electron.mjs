import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {app, BrowserWindow, dialog, ipcMain, nativeTheme} from 'electron';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describeProjects, listProjectRecords, registerNewProjects} from './runtime.mjs';
import {onboardingPreferences, saveOnboardingPreferences} from './store.mjs';
import {resolveSetupPlatform} from './onboarding-platform.mjs';
import {renderOnboardingWindow} from './onboarding-window.mjs';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const preloadPath = path.join(sourceDirectory, 'onboarding-preload.cjs');
const cliEntry = process.env.KITCODE_CLI_ENTRY;
const companionEntry = path.join(sourceDirectory, 'companion-electron.mjs');
const host = process.env.KITCODE_HOST ?? '127.0.0.1';
const port = process.env.KITCODE_PORT ?? '4747';
let window;
let pendingFocus = false;
const gotSingleInstanceLock = app.requestSingleInstanceLock();

function focusSetupWindow(platform) {
  if (!window || window.isDestroyed()) {
    return;
  }
  if (window.isMinimized()) {
    window.restore();
  }
  if (platform === 'darwin') {
    app.dock?.show();
  }
  window.show();
  window.focus();
}

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (window && !window.isDestroyed()) {
      focusSetupWindow(resolveSetupPlatform());
    } else {
      pendingFocus = true;
    }
  });
}

function validFolders(folders) {
  return [...new Set((Array.isArray(folders) ? folders : []).map((folder) => path.resolve(String(folder))))]
    .filter((folder) => {
      try { return fs.statSync(folder).isDirectory(); } catch { return false; }
    });
}

function runCli(args) {
  return new Promise((resolve) => {
    if (!cliEntry) return resolve(false);
    const child = spawn(process.env.KITCODE_NODE_PATH ?? process.execPath, [cliEntry, ...args], {
      detached: true,
      env: {
        ...process.env,
        KITCODE_NO_OPEN: '1',
        NO_COLOR: process.env.NO_COLOR ?? '1',
      },
      stdio: 'ignore',
      windowsHide: true,
    });
    child.once('error', () => resolve(false));
    child.once('exit', (code) => resolve(code === 0));
    child.unref();
  });
}

function openCompanion(view) {
  const child = spawn(process.execPath, [companionEntry], {
    detached: true, stdio: 'ignore',
    env: {
      ...process.env,
      KITCODE_HOST: host,
      KITCODE_PORT: port,
      KITCODE_COMPANION_VIEW: view,
      KITCODE_NO_OPEN: '1',
    },
    windowsHide: true,
  });
  child.unref();
}

function setupWindowOptions(platform) {
  const shared = {
    width: 760,
    height: 610,
    resizable: false,
    maximizable: false,
    movable: true,
    center: true,
    show: false,
    title: 'Welcome to KitCode',
    webPreferences: {preload: preloadPath, contextIsolation: true, nodeIntegration: false, sandbox: true},
  };

  if (platform === 'darwin') {
    return {
      ...shared,
      frame: false,
      backgroundColor: '#1c1c1e',
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: {x: 14, y: 14},
    };
  }

  if (platform === 'win32') {
    return {
      ...shared,
      frame: false,
      backgroundColor: '#202020',
    };
  }

  return {
    ...shared,
    frame: false,
    backgroundColor: '#242424',
  };
}

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) {
    return;
  }

  const platform = resolveSetupPlatform();
  nativeTheme.themeSource = 'dark';
  if (platform === 'darwin') {
    app.dock?.hide();
  }
  window = new BrowserWindow(setupWindowOptions(platform));
  ipcMain.handle('kitcode:onboarding-initial-state', () => ({
    ...onboardingPreferences(),
    projects: listProjectRecords(),
  }));
  ipcMain.handle('kitcode:onboarding-select-folders', async (event) => {
    if (event.sender !== window.webContents) return {canceled: true, paths: []};
    const result = await dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections', 'createDirectory']});
    const paths = validFolders(result.filePaths);
    return {canceled: result.canceled, paths, projects: describeProjects(paths)};
  });
  ipcMain.handle('kitcode:onboarding-submit', async (event, input) => {
    if (event.sender !== window.webContents) return {ok: false, error: 'Invalid setup request.'};
    const folders = validFolders(input?.folders);
    if (!folders.length && !listProjectRecords().length) return {ok: false, error: 'Add at least one readable project folder.'};
    try { registerNewProjects(folders); } catch { return {ok: false, error: 'KitCode could not register one of those folders.'}; }
    const selection = {autoTrack: input?.autoTrack === true, companionView: input?.companionView};
    if (selection.autoTrack && !(await runCli(['track', '--host', host, '--port', port]))) {
      saveOnboardingPreferences({...selection, completed: false});
      return {
        ok: false,
        error: 'Projects were saved, but the tracker could not start. Free the local port and retry.',
        projects: listProjectRecords(),
      };
    }
    const preferences = saveOnboardingPreferences(selection);
    const projects = listProjectRecords();
    setTimeout(() => {
      openCompanion(preferences.companionView);
      window?.close();
    }, 450);
    return {ok: true, projects};
  });
  ipcMain.handle('kitcode:onboarding-close', (event) => {
    if (event.sender === window.webContents) window.close();
    return {closed: true};
  });

  let revealed = false;
  let readyToShow = false;
  let contentLoaded = false;

  function revealSetupWindow() {
    if (revealed || window.isDestroyed() || !readyToShow || !contentLoaded) {
      return;
    }
    revealed = true;
    focusSetupWindow(platform);
    pendingFocus = false;
  }

  window.once('ready-to-show', () => {
    readyToShow = true;
    revealSetupWindow();
  });
  window.webContents.once('did-finish-load', () => {
    contentLoaded = true;
    revealSetupWindow();
  });
  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(renderOnboardingWindow(platform))}`);
});

app.on('window-all-closed', () => {
  ipcMain.removeHandler('kitcode:onboarding-initial-state');
  ipcMain.removeHandler('kitcode:onboarding-select-folders');
  ipcMain.removeHandler('kitcode:onboarding-submit');
  ipcMain.removeHandler('kitcode:onboarding-close');
  app.quit();
});
