const PLATFORM_THEMES = {
  darwin: {
    id: 'darwin',
    marker: 'macos',
    fontStack: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
    shellRadius: '12px',
    chromeClass: 'chrome chrome-macos',
    keyboardHint: '↑↓ move · space select · return continue',
    copy: {
      title: 'KitCode Setup',
      eyebrow: 'Hello, KitCoder.',
      heading: 'Welcome to KitCode',
      lead: 'Configure one local tracker for all of your coding projects.',
      trackingStep: 'Start tracking after setup',
      projectsStep: 'Projects',
      companionStep: 'Companion view',
      addProjects: 'Add Projects…',
      save: 'Save & Open KitCode',
      statusReady: 'Ready',
      emptyProjects: 'No projects added yet. Choose one or more local folders.',
      hint: 'Existing files become the baseline. Source and diffs stay local.',
    },
    tokens: {
      bg: '#1c1c1e',
      panel: '#2c2c2e',
      line: '#3a3a3c',
      lineStrong: '#48484a',
      primary: '#fc0a0a',
      primaryStrong: '#ff6b6b',
      text: '#f5f5f7',
      muted: '#aeaeb2',
      dim: '#8e8e93',
      error: '#ff9d9d',
      accent: '#0a84ff',
      chrome: '#2c2c2e',
      chromeText: '#f5f5f7',
      saveText: '#100606',
      optionBg: '#1c1c1e',
      optionSelected: 'rgba(10, 132, 255, 0.16)',
      optionFocus: '#0a84ff',
      statusBg: '#3a3a3c',
      statusLabel: '#f5f5f7',
    },
  },
  win32: {
    id: 'win32',
    marker: 'windows',
    fontStack: '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
    shellRadius: '8px',
    chromeClass: 'chrome chrome-windows',
    keyboardHint: '↑↓ move · space select · enter continue',
    copy: {
      title: 'KitCode Setup',
      eyebrow: 'Welcome',
      heading: 'KitCode Setup',
      lead: 'Configure one local tracker for all of your coding projects.',
      trackingStep: 'Start tracking after setup',
      projectsStep: 'Projects',
      companionStep: 'Companion view',
      addProjects: 'Add projects…',
      save: 'Save & open KitCode',
      statusReady: 'Ready',
      emptyProjects: 'No projects added. Select one or more local folders.',
      hint: 'Existing files become the baseline. Source and diffs stay local.',
    },
    tokens: {
      bg: '#202020',
      panel: '#2b2b2b',
      line: '#3f3f3f',
      lineStrong: '#5a5a5a',
      primary: '#fc0a0a',
      primaryStrong: '#ff6b6b',
      text: '#ffffff',
      muted: '#c8c8c8',
      dim: '#9a9a9a',
      error: '#ff9d9d',
      accent: '#60cdff',
      chrome: '#1f1f1f',
      chromeText: '#ffffff',
      saveText: '#100606',
      optionBg: '#1a1a1a',
      optionSelected: 'rgba(96, 205, 255, 0.14)',
      optionFocus: '#60cdff',
      statusBg: '#383838',
      statusLabel: '#ffffff',
    },
  },
  linux: {
    id: 'linux',
    marker: 'gtk',
    fontStack: 'Cantarell, "Noto Sans", system-ui, sans-serif',
    shellRadius: '12px',
    chromeClass: 'chrome chrome-linux',
    keyboardHint: '↑↓ move · space select · enter continue',
    copy: {
      title: 'KitCode Setup',
      eyebrow: 'Local-first setup',
      heading: 'KitCode Setup',
      lead: 'Configure one local tracker for all of your coding projects.',
      trackingStep: 'Start tracking after setup',
      projectsStep: 'Projects',
      companionStep: 'Companion view',
      addProjects: 'Add Projects',
      save: 'Save & Open KitCode',
      statusReady: 'Ready',
      emptyProjects: 'No projects added. Select one or more local folders.',
      hint: 'Existing files become the baseline. Source and diffs stay local.',
    },
    tokens: {
      bg: '#242424',
      panel: '#303030',
      line: '#4d4d4d',
      lineStrong: '#666666',
      primary: '#fc0a0a',
      primaryStrong: '#ff6b6b',
      text: '#ffffff',
      muted: '#c0c0c0',
      dim: '#9a9a9a',
      error: '#ff9d9d',
      accent: '#3584e4',
      chrome: '#303030',
      chromeText: '#ffffff',
      saveText: '#100606',
      optionBg: '#262626',
      optionSelected: 'rgba(53, 132, 228, 0.18)',
      optionFocus: '#3584e4',
      statusBg: '#3d3d3d',
      statusLabel: '#ffffff',
    },
  },
};

export function resolveSetupPlatform(platform = process.platform) {
  if (platform === 'darwin') return 'darwin';
  if (platform === 'win32') return 'win32';
  return 'linux';
}

export function setupPlatformTheme(platform) {
  return PLATFORM_THEMES[resolveSetupPlatform(platform)];
}

export function platformThemeCss(theme) {
  const t = theme.tokens;
  return `
    :root {
      color-scheme: dark;
      --bg: ${t.bg};
      --panel: ${t.panel};
      --line: ${t.line};
      --line-strong: ${t.lineStrong};
      --primary: ${t.primary};
      --primary-strong: ${t.primaryStrong};
      --text: ${t.text};
      --muted: ${t.muted};
      --dim: ${t.dim};
      --error: ${t.error};
      --accent: ${t.accent};
      --chrome: ${t.chrome};
      --chrome-text: ${t.chromeText};
      --save-text: ${t.saveText};
      --option-bg: ${t.optionBg};
      --option-selected: ${t.optionSelected};
      --option-focus: ${t.optionFocus};
      --status-bg: ${t.statusBg};
      --status-label: ${t.statusLabel};
      --shell-radius: ${theme.shellRadius};
      --font-stack: ${theme.fontStack};
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-stack);
    }
  `;
}

export function renderPlatformChrome(theme) {
  if (theme.id === 'darwin') {
    return `<header class="${theme.chromeClass}" title="Drag window">
      <div class="window-controls window-controls-macos" aria-hidden="true">
        <span class="traffic-light traffic-close"></span>
        <span class="traffic-light traffic-minimize"></span>
        <span class="traffic-light traffic-maximize"></span>
      </div>
      <span class="chrome-title">${theme.copy.title}</span>
      <span class="chrome-subtitle">Local-first</span>
      <button class="close-button close-button-macos" id="closeButton" type="button" aria-label="Close setup" title="Close"></button>
    </header>`;
  }

  if (theme.id === 'win32') {
    return `<header class="${theme.chromeClass}" title="Drag window">
      <span class="chrome-icon" aria-hidden="true">KC</span>
      <span class="chrome-title">${theme.copy.title}</span>
      <div class="window-controls window-controls-windows">
        <button class="window-control window-minimize" type="button" tabindex="-1" aria-hidden="true" disabled>—</button>
        <button class="window-control window-maximize" type="button" tabindex="-1" aria-hidden="true" disabled>□</button>
        <button class="close-button close-button-windows" id="closeButton" type="button" aria-label="Close setup" title="Close">✕</button>
      </div>
    </header>`;
  }

  return `<header class="${theme.chromeClass}" title="Drag window">
    <span class="chrome-title">${theme.copy.title}</span>
    <span class="chrome-subtitle">${theme.copy.eyebrow}</span>
    <button class="close-button close-button-linux" id="closeButton" type="button" aria-label="Close setup" title="Close">✕</button>
  </header>`;
}

export function renderPlatformStatus(theme) {
  return `<footer class="statusline statusline-${theme.id}">
    <span class="status-badge">${theme.copy.statusReady}</span>
    <span class="status-text" id="statusText">setup:ready</span>
    <span class="keyboard-hint">${theme.keyboardHint}</span>
  </footer>`;
}
