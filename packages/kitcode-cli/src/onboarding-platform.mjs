const PLATFORM_CHROME = {
  darwin: {
    id: 'darwin',
    marker: 'macos',
    chromeClass: 'chrome chrome-macos',
  },
  win32: {
    id: 'win32',
    marker: 'windows',
    chromeClass: 'chrome chrome-windows',
  },
  linux: {
    id: 'linux',
    marker: 'linux',
    chromeClass: 'chrome chrome-linux',
  },
};

export function resolveSetupPlatform(platform = process.platform) {
  if (platform === 'darwin') return 'darwin';
  if (platform === 'win32') return 'win32';
  return 'linux';
}

export function setupPlatformTheme(platform) {
  return PLATFORM_CHROME[resolveSetupPlatform(platform)];
}

export function renderPlatformChrome(theme = setupPlatformTheme()) {
  if (theme.id === 'darwin') {
    // Native traffic lights come from Electron titleBarStyle: 'hiddenInset'.
    // Do not draw HTML duplicates here.
    return `<header class="${theme.chromeClass}" title="Drag window">
      <span class="tab">kitcode-setup</span>
      <span class="safe-label">local-first setup</span>
      <button class="close-button close-button-macos" id="closeButton" type="button" aria-label="Close setup" title="Close"></button>
    </header>`;
  }

  if (theme.id === 'win32') {
    return `<header class="${theme.chromeClass}" title="Drag window">
      <span class="tab">kitcode-setup</span>
      <span class="safe-label">local-first setup</span>
      <div class="window-controls window-controls-windows">
        <button class="window-control window-minimize" type="button" tabindex="-1" aria-hidden="true" disabled>—</button>
        <button class="window-control window-maximize" type="button" tabindex="-1" aria-hidden="true" disabled>□</button>
        <button class="close-button close-button-windows" id="closeButton" type="button" aria-label="Close setup" title="Close">✕</button>
      </div>
    </header>`;
  }

  return `<header class="${theme.chromeClass}" title="Drag window">
    <span class="tab">kitcode-setup</span>
    <span class="safe-label">local-first setup</span>
    <button class="close-button close-button-linux" id="closeButton" type="button" aria-label="Close setup" title="Close">✕</button>
  </header>`;
}
