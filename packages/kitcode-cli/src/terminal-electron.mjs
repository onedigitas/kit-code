import {app, BrowserWindow, nativeTheme, screen, shell} from 'electron';

const terminalUrl = process.env.KITCODE_TERMINAL_URL ?? 'http://127.0.0.1:4747/terminal';

function createTerminalWindow() {
  nativeTheme.themeSource = 'dark';

  const display = screen.getPrimaryDisplay();
  const {workArea} = display;
  const width = 960;
  const height = 620;
  const minWidth = 680;
  const minHeight = 420;

  const window = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    x: Math.round(workArea.x + ((workArea.width - width) / 2)),
    y: Math.round(workArea.y + ((workArea.height - height) / 2)),
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
