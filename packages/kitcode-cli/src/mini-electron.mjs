import {app, BrowserWindow, nativeTheme, screen, shell} from 'electron';

const miniUrl = process.env.KITCODE_MINI_URL ?? 'http://127.0.0.1:4747/mini';

function createMiniWindow() {
  nativeTheme.themeSource = 'dark';

  const display = screen.getPrimaryDisplay();
  const {workArea} = display;
  const width = 320;
  const height = 148;
  const rightMargin = 28;
  const bottomMargin = 72;

  const window = new BrowserWindow({
    width,
    height,
    minWidth: width,
    minHeight: height,
    x: Math.round(workArea.x + workArea.width - width - rightMargin),
    y: Math.round(workArea.y + workArea.height - height - bottomMargin),
    title: 'KitCode Mini',
    frame: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    backgroundColor: '#0A0A0A',
    roundedCorners: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.setMinimumSize(width, height);
  window.setMaximumSize(width, height);
  window.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'};
  });
  window.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  window.setAlwaysOnTop(true, 'floating');
  window.once('ready-to-show', () => window.show());
  window.loadURL(miniUrl);
}

app.whenReady().then(createMiniWindow);

app.on('window-all-closed', () => {
  app.quit();
});
