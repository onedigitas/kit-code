import {app, BrowserWindow, ipcMain, nativeTheme, screen, shell} from 'electron';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const terminalUrl = process.env.KITCODE_TERMINAL_URL ?? 'http://127.0.0.1:4747/terminal';
const preloadPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'terminal-preload.cjs');

const terminalWidth = 960;
const terminalHeight = 620;
const terminalMinWidth = 680;
const terminalMinHeight = 420;
const largeMaxSize = 10000;

const fixedPresets = {
  compact: {
    width: 420,
    height: 74,
    position: 'bottom-right',
    rightMargin: 28,
    bottomMargin: 72,
  },
  progress: {
    width: 320,
    height: 148,
    position: 'bottom-right',
    rightMargin: 28,
    bottomMargin: 72,
  },
  watch: {
    width: 176,
    height: 176,
    position: 'top-right',
    rightMargin: 28,
    topMargin: 24,
  },
};

const validModes = new Set(['terminal', ...Object.keys(fixedPresets)]);

function positionForPreset(workArea, preset) {
  if (preset.position === 'bottom-right') {
    return {
      x: Math.round(workArea.x + workArea.width - preset.width - preset.rightMargin),
      y: Math.round(workArea.y + workArea.height - preset.height - preset.bottomMargin),
    };
  }

  return {
    x: Math.round(workArea.x + workArea.width - preset.width - preset.rightMargin),
    y: Math.round(workArea.y + preset.topMargin),
  };
}

function applyTerminalPreset(window) {
  const {workArea} = screen.getPrimaryDisplay();

  window.setAlwaysOnTop(false);
  window.setResizable(true);
  window.setMaximizable(true);
  window.setMinimizable(true);
  window.setFullScreenable(true);
  window.setMaximumSize(largeMaxSize, largeMaxSize);
  window.setMinimumSize(terminalMinWidth, terminalMinHeight);
  window.setSize(terminalWidth, terminalHeight, false);
  window.setPosition(
    Math.round(workArea.x + ((workArea.width - terminalWidth) / 2)),
    Math.round(workArea.y + ((workArea.height - terminalHeight) / 2)),
    false,
  );
}

function applyFixedPreset(window, mode) {
  const preset = fixedPresets[mode];
  const {workArea} = screen.getPrimaryDisplay();
  const {x, y} = positionForPreset(workArea, preset);

  window.setResizable(false);
  window.setMaximizable(false);
  window.setMinimizable(false);
  window.setFullScreenable(false);
  window.setMaximumSize(largeMaxSize, largeMaxSize);
  window.setMinimumSize(preset.width, preset.height);
  window.setMaximumSize(preset.width, preset.height);
  window.setSize(preset.width, preset.height, false);
  window.setPosition(x, y, false);
  window.setAlwaysOnTop(true, 'floating');
}

function applyViewMode(window, mode) {
  const nextMode = validModes.has(mode) ? mode : 'terminal';

  if (nextMode === 'terminal') {
    applyTerminalPreset(window);
  } else {
    applyFixedPreset(window, nextMode);
  }

  return nextMode;
}

function createTerminalWindow() {
  nativeTheme.themeSource = 'dark';

  const display = screen.getPrimaryDisplay();
  const {workArea} = display;

  const window = new BrowserWindow({
    width: terminalWidth,
    height: terminalHeight,
    minWidth: terminalMinWidth,
    minHeight: terminalMinHeight,
    x: Math.round(workArea.x + ((workArea.width - terminalWidth) / 2)),
    y: Math.round(workArea.y + ((workArea.height - terminalHeight) / 2)),
    title: 'KitCode Terminal',
    frame: false,
    resizable: true,
    movable: true,
    alwaysOnTop: false,
    fullscreenable: true,
    maximizable: true,
    minimizable: true,
    backgroundColor: '#050705',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  ipcMain.handle('kitcode:set-view-mode', (event, mode) => {
    if (event.sender !== window.webContents) {
      return {mode: 'terminal'};
    }

    return {mode: applyViewMode(window, mode)};
  });

  window.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'};
  });
  window.once('closed', () => {
    ipcMain.removeHandler('kitcode:set-view-mode');
  });
  window.once('ready-to-show', () => window.show());
  window.loadURL(terminalUrl);
}

app.whenReady().then(createTerminalWindow);

app.on('window-all-closed', () => {
  app.quit();
});
