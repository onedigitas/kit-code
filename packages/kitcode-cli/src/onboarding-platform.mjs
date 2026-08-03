const PLATFORM_CHROME = {
  darwin: {
    id: 'darwin',
    marker: 'macos',
    chromeClass: 'title-bar',
  },
  win32: {
    id: 'win32',
    marker: 'windows',
    chromeClass: 'title-bar',
  },
  linux: {
    id: 'linux',
    marker: 'linux',
    chromeClass: 'title-bar',
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

export function renderPlatformChrome(theme = setupPlatformTheme()) {
  return `<div class="${theme.chromeClass}" title="Drag window">
    <button class="dot filled dot-close" id="closeButton" type="button" aria-label="Close setup" title="Close"></button>
    <span class="dot" aria-hidden="true"></span>
    <span class="dot" aria-hidden="true"></span>
  </div>`;
}
