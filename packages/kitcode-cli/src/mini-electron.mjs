import {app, BrowserWindow, nativeTheme, screen} from 'electron';

const miniUrl = process.env.KITCODE_MINI_URL ?? 'http://127.0.0.1:4747/mini';

function createMiniWindow() {
  nativeTheme.themeSource = 'dark';

  const display = screen.getPrimaryDisplay();
  const {workArea} = display;
  const width = 340;
  const height = 430;
  const margin = 22;

  const window = new BrowserWindow({
    width,
    height,
    minWidth: 300,
    minHeight: 360,
    x: Math.round(workArea.x + workArea.width - width - margin),
    y: Math.round(workArea.y + margin),
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
  window.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  window.setAlwaysOnTop(true, 'floating');
  window.once('ready-to-show', () => window.show());
  window.loadURL(miniUrl);
}

app.whenReady().then(createMiniWindow);

app.on('window-all-closed', () => {
  app.quit();
});
