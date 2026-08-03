import {app, BrowserWindow, nativeTheme, screen, shell} from 'electron';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const terminalUrl = process.env.KITCODE_TERMINAL_URL ?? 'http://127.0.0.1:4747/terminal';
const preloadPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'terminal-preload.cjs');

const terminalWidth = 960;
const terminalHeight = 620;
const terminalMinWidth = 680;
const terminalMinHeight = 420;

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

  window.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'};
  });
  window.once('ready-to-show', () => window.show());
  window.loadURL(terminalUrl);
}

app.whenReady().then(createTerminalWindow);

app.on('window-all-closed', () => {
  app.quit();
});
