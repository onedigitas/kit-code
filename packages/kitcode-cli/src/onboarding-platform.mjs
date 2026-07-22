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

const PLATFORM_ALIASES = {
  darwin: 'darwin',
  macos: 'darwin',
  mac: 'darwin',
  win32: 'win32',
  windows: 'win32',
  win: 'win32',
  linux: 'linux',
};

export function normalizeSetupPlatform(value) {
  if (value == null || value === '') {
    return null;
  }
  return PLATFORM_ALIASES[String(value).trim().toLowerCase()] ?? null;
}

export function resolveSetupPlatform(platform = process.platform) {
  return normalizeSetupPlatform(platform) ?? 'linux';
}

export function setupPlatformTheme(platform) {
  return PLATFORM_CHROME[resolveSetupPlatform(platform)];
}

function renderHeaderStart() {
  return `<div class="header-brand">
      <span class="brand-icon" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
      <span class="header-title">KITCODE SETUP</span>
    </div>
    <div class="header-meta">
      <span class="safe-label">local-first setup</span>
      <span class="status-dot" aria-hidden="true"></span>`;
}

export function renderPlatformChrome(theme = setupPlatformTheme()) {
  if (theme.id === 'darwin') {
    // Native traffic lights come from Electron titleBarStyle: 'hiddenInset'.
    // Do not draw HTML duplicates here.
    return `<header class="${theme.chromeClass}" title="Drag window">
      ${renderHeaderStart()}
      </div>
      <button class="close-button close-button-macos" id="closeButton" type="button" aria-label="Close setup" title="Close"></button>
    </header>`;
  }

  if (theme.id === 'win32') {
    return `<header class="${theme.chromeClass}" title="Drag window">
      ${renderHeaderStart()}
      <div class="window-controls window-controls-windows">
        <button class="window-control window-minimize" type="button" tabindex="-1" aria-hidden="true" disabled>—</button>
        <button class="window-control window-maximize" type="button" tabindex="-1" aria-hidden="true" disabled>□</button>
        <button class="close-button close-button-windows" id="closeButton" type="button" aria-label="Close setup" title="Close">✕</button>
      </div>
      </div>
    </header>`;
  }

  return `<header class="${theme.chromeClass}" title="Drag window">
    ${renderHeaderStart()}
    <button class="close-button close-button-linux" id="closeButton" type="button" aria-label="Close setup" title="Close">✕</button>
    </div>
  </header>`;
}
