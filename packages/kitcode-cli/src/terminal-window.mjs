export function renderTerminalWindow() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KitCode Terminal</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #050705;
      --panel: #0b0f0c;
      --line: #2f1515;
      --line-strong: #6f2020;
      --primary: #fc0a0a;
      --primary-strong: #ff6b6b;
      --gold: #ffd84a;
      --cyan: #75d7ff;
      --red: #ff6b6b;
      --text: #f4ffee;
      --muted: #a6b6a2;
      --dim: #657360;
      background: var(--bg);
      color: var(--text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: transparent;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body[data-view-mode="terminal"] {
      min-width: 680px;
      min-height: 420px;
      background: var(--bg);
      user-select: text;
    }

    .shell {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      overflow: hidden;
      border: 1px solid var(--line-strong);
      background:
        linear-gradient(180deg, rgba(252, 10, 10, 0.08), transparent 34%),
        var(--panel);
    }

    body:not([data-view-mode="terminal"]) .shell {
      border-radius: 8px;
      box-shadow:
        0 18px 44px rgba(0, 0, 0, 0.46),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    body[data-view-mode="watch"] .shell {
      border-radius: 8px;
    }

    .chrome,
    .statusline {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
      border-bottom: 1px solid var(--line);
      background: #090707;
      color: var(--muted);
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }

    .chrome {
      min-height: 34px;
      padding: 0 8px 0 14px;
      -webkit-app-region: drag;
    }

    body:not([data-view-mode="terminal"]) .chrome {
      min-height: 30px;
      padding-left: 10px;
      border-bottom-color: rgba(255, 255, 255, 0.06);
      background: rgba(9, 7, 7, 0.82);
    }

    .tab {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      border-right: 1px solid var(--line);
      color: var(--text);
    }

    .tab[data-active="true"] {
      background: #1a0808;
      color: var(--primary-strong);
    }

    body:not([data-view-mode="terminal"]) .tab {
      display: none;
    }

    .safe-label {
      margin-left: auto;
      color: var(--muted);
    }

    body:not([data-view-mode="terminal"]) .safe-label {
      display: none;
    }

    .view-switcher {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: 0;
      padding: 2px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.035);
      -webkit-app-region: no-drag;
    }

    .view-switcher-label {
      padding: 0 6px;
      color: var(--muted);
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
    }

    body[data-view-mode="terminal"] .view-switcher {
      margin-left: 0;
    }

    body:not([data-view-mode="terminal"]) .view-switcher {
      margin-left: auto;
    }

    body[data-view-mode="watch"] .view-switcher-label {
      display: none;
    }

    .mode-button,
    .pet-toggle,
    .terminal-close {
      border: 0;
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      line-height: 1;
      -webkit-app-region: no-drag;
    }

    .mode-button {
      width: 28px;
      height: 24px;
      display: grid;
      place-items: center;
      background: transparent;
    }

    .mode-button[aria-pressed="true"] {
      background: var(--primary);
      color: #100606;
    }

    .pet-toggle {
      min-width: 68px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      flex: 0 0 auto;
      padding: 0 7px 0 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.035);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.04em;
    }

    .pet-toggle-mark {
      width: 18px;
      height: 18px;
      display: grid;
      place-items: center;
      border-radius: 5px;
      background: #181b18;
      color: var(--primary);
      font-size: 8px;
      letter-spacing: -0.04em;
    }

    .pet-toggle[aria-pressed="true"] {
      border-color: var(--primary);
      color: var(--primary-strong);
      background: rgba(252, 10, 10, 0.12);
    }

    .pet-toggle[aria-pressed="true"] .pet-toggle-mark {
      background: var(--primary);
      color: #100606;
    }

    .pet-toggle:disabled {
      cursor: not-allowed;
      opacity: 0.42;
    }

    body:not([data-view-mode="terminal"]) .pet-toggle {
      width: 26px;
      min-width: 26px;
      padding: 0;
    }

    body:not([data-view-mode="terminal"]) .pet-toggle-label {
      display: none;
    }

    body[data-view-mode="watch"] .view-switcher {
      gap: 0;
    }

    body[data-view-mode="watch"] .mode-button {
      width: 22px;
    }

    .mode-button:hover,
    .mode-button:focus-visible,
    .pet-toggle:not(:disabled):hover,
    .pet-toggle:not(:disabled):focus-visible,
    .terminal-close:hover,
    .terminal-close:focus-visible {
      color: var(--text);
      background: rgba(252, 10, 10, 0.16);
      outline: none;
    }

    .mode-icon {
      width: 14px;
      height: 14px;
      display: block;
      position: relative;
    }

    .mode-icon::before,
    .mode-icon::after {
      content: "";
      position: absolute;
      border-color: currentColor;
      background: currentColor;
    }

    .mode-icon-terminal::before {
      inset: 1px;
      border: 1px solid currentColor;
      background: transparent;
    }

    .mode-icon-terminal::after {
      left: 4px;
      bottom: 4px;
      width: 6px;
      height: 1px;
    }

    .mode-icon-compact::before,
    .mode-icon-compact::after {
      left: 1px;
      right: 1px;
      height: 2px;
    }

    .mode-icon-compact::before {
      top: 4px;
    }

    .mode-icon-compact::after {
      bottom: 4px;
    }

    .mode-icon-progress::before {
      inset: 2px;
      border: 1px solid currentColor;
      background: transparent;
    }

    .mode-icon-progress::after {
      left: 4px;
      bottom: 4px;
      width: 6px;
      height: 4px;
    }

    .mode-icon-watch::before {
      inset: 1px;
      border: 1px solid currentColor;
      border-radius: 999px;
      background: transparent;
    }

    .mode-icon-watch::after {
      left: 6px;
      top: 3px;
      width: 1px;
      height: 6px;
      transform: rotate(35deg);
      transform-origin: bottom center;
    }

    .terminal-close {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      background: transparent;
      font-size: 18px;
    }

    .mode-view {
      min-width: 0;
      min-height: 0;
      display: none;
      overflow: hidden;
    }

    body[data-view-mode="terminal"] .terminal-view,
    body[data-view-mode="compact"] .compact-view,
    body[data-view-mode="progress"] .progress-view,
    body[data-view-mode="watch"] .watch-view {
      display: grid;
    }

    .terminal-view {
      grid-template-rows: auto minmax(0, 1fr) auto auto;
      background:
        linear-gradient(180deg, rgba(252, 10, 10, 0.08), transparent 34%),
        var(--panel);
    }

    .hero {
      min-width: 0;
      display: grid;
      gap: 10px;
      padding: 22px 24px 18px;
      border-bottom: 1px solid var(--line);
      background:
        linear-gradient(90deg, rgba(252, 10, 10, 0.13), transparent 64%),
        #0d0505;
    }

    .eyebrow {
      color: var(--primary-strong);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--text);
      font-size: 92px;
      font-weight: 950;
      line-height: 0.86;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .subtitle {
      max-width: 880px;
      margin: 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .output {
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 18px 24px;
      color: var(--text);
      font-size: 14px;
      line-height: 1.55;
      scrollbar-color: var(--line-strong) transparent;
      -webkit-app-region: no-drag;
    }

    .entry {
      margin: 0 0 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .entry:last-child {
      margin-bottom: 0;
    }

    .prompt-line {
      color: var(--muted);
    }

    .success {
      color: var(--primary-strong);
    }

    .warning {
      color: var(--gold);
    }

    .error {
      color: var(--red);
    }

    .input-row {
      min-width: 0;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 9px;
      padding: 12px 24px 15px;
      border-top: 1px solid var(--line);
      background: #090505;
      -webkit-app-region: no-drag;
    }

    .prompt-label {
      color: var(--primary-strong);
      font-size: 14px;
      font-weight: 900;
      white-space: nowrap;
    }

    input {
      width: 100%;
      min-width: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--text);
      caret-color: var(--primary-strong);
      font: inherit;
      font-size: 14px;
      -webkit-app-region: no-drag;
    }

    input::placeholder {
      color: var(--dim);
    }

    .statusline {
      min-height: 28px;
      padding: 0;
      border-top: 1px solid var(--line);
      border-bottom: 0;
      background: #170b0b;
      color: var(--text);
    }

    .normal-mode {
      display: inline-flex;
      align-items: center;
      align-self: stretch;
      padding: 0 12px;
      background: var(--primary);
      color: #100606;
      font-weight: 900;
      text-transform: uppercase;
    }

    .status-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .commands {
      margin-left: auto;
      padding: 0 12px;
      color: var(--muted);
    }

    .compact-view,
    .progress-view,
    .watch-view {
      -webkit-app-region: drag;
    }

    .compact-view {
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      padding: 9px 14px 13px;
      background:
        linear-gradient(90deg, rgba(252, 10, 10, 0.16), transparent 56%),
        #140909;
    }

    .compact-percent {
      color: var(--text);
      font-size: 30px;
      font-weight: 900;
      line-height: 1;
      white-space: nowrap;
    }

    .marquee {
      min-width: 0;
      overflow: hidden;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }

    .marquee span {
      display: inline-block;
      min-width: 100%;
      animation: slide-copy 7s linear infinite;
    }

    @keyframes slide-copy {
      from { transform: translateX(16%); }
      to { transform: translateX(-100%); }
    }

    .compact-state,
    .state-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-strong);
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: currentColor;
      box-shadow: 0 0 14px currentColor;
    }

    .progress-view {
      grid-template-rows: auto 1fr auto;
      gap: 8px;
      padding: 10px 14px 13px;
      background:
        linear-gradient(135deg, rgba(252, 10, 10, 0.16), transparent 42%),
        #140909;
    }

    .progress-top {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .brand {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text);
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .mark {
      width: 17px;
      height: 17px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(252, 10, 10, 0.52);
      background: rgba(252, 10, 10, 0.14);
      color: var(--primary-strong);
      font-size: 12px;
      font-weight: 900;
      line-height: 1;
    }

    .progress-main {
      min-width: 0;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: end;
      gap: 13px;
    }

    .big-percent {
      color: var(--text);
      font-size: 43px;
      font-weight: 900;
      line-height: 0.95;
      letter-spacing: 0;
      white-space: nowrap;
    }

    .copy {
      min-width: 0;
      display: grid;
      gap: 5px;
      padding-bottom: 4px;
    }

    .label {
      overflow: hidden;
      color: var(--primary-strong);
      font-size: 12px;
      font-weight: 900;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .hint {
      overflow: hidden;
      color: var(--muted);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bar-track {
      width: 100%;
      height: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.08);
    }

    .bar-fill {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--primary-strong));
      box-shadow: 0 0 18px rgba(252, 10, 10, 0.34);
      transition: width 180ms ease;
    }

    .watch-view {
      place-items: center;
      padding: 10px;
      background:
        linear-gradient(135deg, rgba(252, 10, 10, 0.14), transparent 46%),
        #100707;
    }

    .watch-face {
      width: 124px;
      height: 124px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(252, 10, 10, 0.46);
      border-radius: 999px;
      background:
        radial-gradient(circle, rgba(252, 10, 10, 0.12), transparent 54%),
        #0a0505;
    }

    .watch-inner {
      display: grid;
      justify-items: center;
      gap: 6px;
      text-align: center;
    }

    .watch-percent {
      color: var(--text);
      font-size: 36px;
      font-weight: 950;
      line-height: 1;
    }

    .watch-label {
      max-width: 88px;
      overflow: hidden;
      color: var(--primary-strong);
      font-size: 10px;
      font-weight: 900;
      text-overflow: ellipsis;
      text-transform: uppercase;
      white-space: nowrap;
    }

    body[data-state="ready"] {
      --primary-strong: #ff7b7b;
    }

    body[data-state="offline"],
    body[data-state="reconnecting"] {
      --primary: #8f98a1;
      --primary-strong: #c0c8ce;
      --line-strong: #2f3637;
    }

    @media (max-width: 720px) {
      body[data-view-mode="terminal"] {
        min-width: 360px;
        min-height: 420px;
      }

      .hero,
      .output,
      .input-row {
        padding-left: 16px;
        padding-right: 16px;
      }

      h1 {
        font-size: 48px;
      }
    }
  </style>
</head>
<body data-view-mode="terminal" data-state="offline">
  <main class="shell" id="terminal">
    <div class="chrome" title="Drag window">
      <span class="tab" data-active="true">kitcode-terminal</span>
      <span class="tab">~/campaign</span>
      <span class="safe-label">safe-shell</span>
      <nav class="view-switcher" aria-label="View mode">
        <span class="view-switcher-label">View mode</span>
        <button class="mode-button" type="button" data-mode="terminal" title="Terminal view" aria-label="Terminal view" aria-pressed="true"><span class="mode-icon mode-icon-terminal" aria-hidden="true"></span></button>
        <button class="mode-button" type="button" data-mode="compact" title="Compact bottom-right view" aria-label="Compact view" aria-pressed="false"><span class="mode-icon mode-icon-compact" aria-hidden="true"></span></button>
        <button class="mode-button" type="button" data-mode="progress" title="Progress bottom-right view" aria-label="Progress view" aria-pressed="false"><span class="mode-icon mode-icon-progress" aria-hidden="true"></span></button>
        <button class="mode-button" type="button" data-mode="watch" title="Watch widget view" aria-label="Watch view" aria-pressed="false"><span class="mode-icon mode-icon-watch" aria-hidden="true"></span></button>
      </nav>
      <button class="pet-toggle" id="petToggle" data-testid="pet-toggle" type="button" title="Desktop pet requires KitCode Terminal" aria-label="Show pet" aria-pressed="false" disabled><span class="pet-toggle-mark" aria-hidden="true">KC</span><span class="pet-toggle-label">PET OFF</span></button>
      <button class="terminal-close" id="closeButton" type="button" title="Close" aria-label="Close">x</button>
    </div>

    <section class="mode-view terminal-view" aria-label="KitCode terminal">
      <section class="hero" aria-label="KitCode terminal welcome">
        <span class="eyebrow">Hello, KitCoder.</span>
        <h1>KITCODE TERMINAL</h1>
        <p class="subtitle">A safe KitCode command surface. It can read local tracker summaries and open KitCode views, but it never runs your system shell.</p>
      </section>

      <section class="output" id="output" aria-live="polite" aria-label="Terminal output"></section>

      <form class="input-row" id="commandForm" autocomplete="off">
        <label class="prompt-label" for="commandInput">kitcode ~ %</label>
        <input id="commandInput" name="command" spellcheck="false" autocomplete="off" placeholder="type help" autofocus>
      </form>

      <footer class="statusline">
        <span class="normal-mode">NORMAL</span>
        <span class="status-text" id="statusText">KitCode safe terminal ready</span>
        <span class="commands">commands: help status summary rewards dashboard clear</span>
      </footer>
    </section>

    <section class="mode-view compact-view" aria-label="Compact progress view">
      <span class="compact-percent" data-field="percent">0%</span>
      <span class="marquee"><span data-field="marquee">Tracker offline - Run kitcode track</span></span>
      <span class="compact-state"><span class="dot"></span><span data-field="status">Offline</span></span>
    </section>

    <section class="mode-view progress-view" aria-label="Progress view">
      <div class="progress-top">
        <span class="brand"><span class="mark">&gt;</span><span>KitCode</span></span>
        <span class="state-pill"><span class="dot"></span><span data-field="status">Offline</span></span>
      </div>
      <div class="progress-main">
        <span class="big-percent" data-field="percent">0%</span>
        <span class="copy">
          <span class="label" data-field="label">Tracker offline</span>
          <span class="hint" data-field="hint">Run kitcode track</span>
        </span>
      </div>
      <span class="bar-track" role="progressbar" aria-label="Break progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="bar-fill" data-field="bar"></span>
      </span>
    </section>

    <section class="mode-view watch-view" aria-label="Watch progress view">
      <div class="watch-face">
        <span class="watch-inner">
          <span class="watch-percent" data-field="percent">0%</span>
          <span class="watch-label" data-field="status">Offline</span>
          <span class="bar-track" role="progressbar" aria-label="Break progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <span class="bar-fill" data-field="bar"></span>
          </span>
        </span>
      </div>
    </section>
  </main>

  <script>
    const DASHBOARD_URL = 'https://kitcode.onedigitas.com/';
    const HELP_LINES = [
      'Available KitCode commands:',
      '  help       Show this command list.',
      '  status     Show tracker connection and project totals.',
      '  summary    Show compact break progress from the local tracker.',
      '  rewards    Show reward tier states from the local tracker.',
      '  dashboard  Open the KitCode dashboard.',
      '  clear      Clear terminal output.',
      '',
      'This is a KitCode safe shell. It does not run system commands.'
    ];
    const nodes = {
      output: document.getElementById('output'),
      form: document.getElementById('commandForm'),
      input: document.getElementById('commandInput'),
      statusText: document.getElementById('statusText'),
      closeButton: document.getElementById('closeButton'),
      petToggle: document.getElementById('petToggle'),
      modeButtons: Array.from(document.querySelectorAll('[data-mode]')),
    };
    const history = [];
    let historyIndex = 0;
    let latestSummary = null;
    let petVisible = false;

    function renderPetVisibility(visible) {
      petVisible = Boolean(visible);
      nodes.petToggle.setAttribute('aria-pressed', String(petVisible));
      nodes.petToggle.setAttribute('aria-label', petVisible ? 'Hide pet' : 'Show pet');
      nodes.petToggle.title = petVisible ? 'Hide pet' : 'Show pet';
      nodes.petToggle.querySelector('.pet-toggle-label').textContent = petVisible ? 'PET ON' : 'PET OFF';
    }

    const hasDesktopPetBridge = Boolean(
      window.kitcodeTerminal?.setPetVisible &&
      window.kitcodeTerminal?.getPetVisible &&
      window.kitcodeTerminal?.onPetVisibilityChanged,
    );

    if (hasDesktopPetBridge) {
      nodes.petToggle.disabled = false;
      nodes.petToggle.title = 'Show pet';
      window.kitcodeTerminal.getPetVisible()
        .then((result) => renderPetVisibility(result?.visible))
        .catch(() => renderPetVisibility(false));
      window.kitcodeTerminal.onPetVisibilityChanged((visible) => renderPetVisibility(visible));
    } else {
      nodes.petToggle.disabled = true;
      nodes.petToggle.title = 'Desktop pet requires KitCode Terminal';
      nodes.petToggle.setAttribute('aria-label', 'Desktop pet requires KitCode Terminal');
    }

    nodes.petToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!hasDesktopPetBridge || nodes.petToggle.disabled) {
        return;
      }

      nodes.petToggle.disabled = true;
      window.kitcodeTerminal.setPetVisible(!petVisible)
        .then((result) => renderPetVisibility(result?.visible))
        .catch(() => renderPetVisibility(petVisible))
        .finally(() => {
          nodes.petToggle.disabled = false;
        });
    });

    nodes.closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      window.close();
    });

    function setViewMode(mode) {
      document.body.dataset.viewMode = mode;
      for (const button of nodes.modeButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      }

      if (window.kitcodeTerminal?.setViewMode) {
        window.kitcodeTerminal.setViewMode(mode).catch(() => {});
      }

      if (mode === 'terminal') {
        nodes.input.focus();
      }
    }

    for (const button of nodes.modeButtons) {
      button.addEventListener('click', () => setViewMode(button.dataset.mode));
    }

    function append(text, className = '') {
      const entry = document.createElement('pre');
      entry.className = ['entry', className].filter(Boolean).join(' ');
      entry.textContent = text;
      nodes.output.appendChild(entry);
      nodes.output.scrollTop = nodes.output.scrollHeight;
    }

    function appendCommand(command) {
      append('kitcode ~ % ' + command, 'prompt-line');
    }

    function clearOutput() {
      nodes.output.textContent = '';
    }

    async function fetchSummary() {
      const response = await fetch('/api/summary', {cache: 'no-store'});

      if (!response.ok) {
        throw new Error('summary request failed');
      }

      return response.json();
    }

    function formatSeconds(value) {
      const total = Math.max(0, Math.floor(Number(value) || 0));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;

      if (hours > 0) {
        return hours + 'h ' + minutes + 'm';
      }

      if (minutes > 0) {
        return minutes + 'm ' + seconds + 's';
      }

      return seconds + 's';
    }

    function safePercent(current, target) {
      if (target <= 0) return current > 0 ? 100 : 0;
      return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
    }

    function effortToProgress(effort) {
      const normalized = Math.max(0, effort);
      const labels = [10, 20, 30, 50, 100];

      for (let index = 0; index < labels.length; index += 1) {
        const label = labels[index];
        const start = labels[index - 1] ?? 0;

        if (normalized <= label) {
          const range = label - start;
          const rangeProgress = range === 0 ? 1 : (normalized - start) / range;
          return Math.min(100, Math.max(0, start + (rangeProgress * range)));
        }
      }

      return 100;
    }

    function getBreakProgress(summary) {
      const milestones = summary?.reward?.milestones ?? [];
      const finalMilestone = milestones[milestones.length - 1];
      const timeTarget = finalMilestone?.requiredSeconds ?? summary?.reward?.requiredSeconds ?? 1;
      const equalsTarget = finalMilestone?.requiredEquals ?? summary?.reward?.requiredEquals ?? 1;
      const timeEffort = safePercent(summary?.reward?.earnedSeconds ?? 0, timeTarget);
      const equalsEffort = safePercent(summary?.reward?.totalEquals ?? 0, equalsTarget);

      return Math.round(effortToProgress(Math.min(timeEffort, equalsEffort)));
    }

    function setAll(field, value) {
      for (const node of document.querySelectorAll('[data-field="' + field + '"]')) {
        if (field === 'bar') {
          node.style.width = value;
        } else {
          node.textContent = value;
        }
      }
    }

    function setProgressbar(value) {
      for (const node of document.querySelectorAll('[role="progressbar"]')) {
        node.setAttribute('aria-valuenow', String(value));
      }
    }

    function renderGlance(summary, connectionState = 'online') {
      const reward = summary?.reward ?? {};
      const global = summary?.global ?? {};
      const percent = summary ? getBreakProgress(summary) : 0;
      const readyTier = (reward.tiers ?? []).find((tier) => tier.status === 'ready');
      const tracking = Number(global.trackingProjects) || 0;
      let state = 'offline';
      let status = 'offline';
      let label = 'Tracker offline';
      let hint = 'Run kitcode track';

      if (connectionState === 'reconnecting') {
        state = 'reconnecting';
        status = 'sync';
        label = 'Reconnecting';
        hint = 'Waiting for tracker';
      } else if (readyTier) {
        state = 'ready';
        status = 'ready';
        label = 'Break ready';
        hint = 'Open dashboard to claim';
      } else if (tracking > 0) {
        state = 'live';
        status = 'live';
        label = 'Break progress';
        hint = 'Tracking your focus';
      } else if (summary) {
        state = 'idle';
        status = 'idle';
        label = 'No project active';
        hint = 'Run kitcode add';
      }

      document.body.dataset.state = state;
      setAll('percent', percent + '%');
      setAll('status', status);
      setAll('label', label);
      setAll('hint', hint);
      setAll('bar', percent + '%');
      setAll('marquee', label + ' - ' + hint + ' - ' + percent + '%');
      setProgressbar(percent);
    }

    function summarizeStatus(summary) {
      const global = summary?.global ?? {};
      const reward = summary?.reward ?? {};
      const tracking = Number(global.trackingProjects) || 0;
      const total = Number(global.totalProjects) || tracking;
      const readyTier = (reward.tiers ?? []).find((tier) => tier.status === 'ready');

      return [
        'Tracker: online',
        'Tracked projects: ' + tracking,
        'Total projects: ' + total,
        'Reward state: ' + (readyTier ? readyTier.percent + '% ready' : 'tracking progress')
      ].join('\\n');
    }

    function summarizeProgress(summary) {
      const reward = summary?.reward ?? {};
      const earnedSeconds = Number(reward.earnedSeconds) || 0;
      const requiredSeconds = Number(reward.requiredSeconds) || 1;
      const totalEquals = Number(reward.totalEquals) || 0;
      const requiredEquals = Number(reward.requiredEquals) || 1;
      const timePercent = safePercent(earnedSeconds, requiredSeconds);
      const equalsPercent = safePercent(totalEquals, requiredEquals);

      return [
        'Break progress summary:',
        '  active time: ' + formatSeconds(earnedSeconds) + ' / ' + formatSeconds(requiredSeconds) + ' (' + timePercent + '%)',
        '  counted equals: ' + totalEquals + ' / ' + requiredEquals + ' (' + equalsPercent + '%)',
        '  time left: ' + formatSeconds(reward.timeLeftSeconds)
      ].join('\\n');
    }

    function summarizeRewards(summary) {
      const tiers = summary?.reward?.tiers ?? [];

      if (tiers.length === 0) {
        return 'No local reward tiers were returned by the tracker.';
      }

      return [
        'Reward tiers:',
        ...tiers.map((tier) => {
          const label = String(tier.percent).padStart(3, ' ') + '%';
          return '  ' + label + '  ' + tier.status + '  ' + tier.code;
        })
      ].join('\\n');
    }

    async function runCommand(rawCommand) {
      const command = rawCommand.trim();
      const normalized = command.toLowerCase();

      if (!command) {
        return;
      }

      appendCommand(command);
      nodes.statusText.textContent = 'running: ' + normalized;

      if (normalized === 'clear') {
        clearOutput();
        nodes.statusText.textContent = 'output cleared';
        return;
      }

      if (normalized === 'help') {
        append(HELP_LINES.join('\\n'), 'success');
      } else if (normalized === 'status') {
        append(summarizeStatus(await fetchSummary()), 'success');
      } else if (normalized === 'summary') {
        window.kitcodeTerminal?.triggerPetAction?.('review');
        append(summarizeProgress(await fetchSummary()), 'success');
      } else if (normalized === 'rewards') {
        window.kitcodeTerminal?.triggerPetAction?.('review');
        append(summarizeRewards(await fetchSummary()), 'success');
      } else if (normalized === 'dashboard') {
        window.kitcodeTerminal?.triggerPetAction?.('review');
        window.open(DASHBOARD_URL, '_blank', 'noopener');
        append('Opening KitCode dashboard...', 'success');
      } else {
        append('Command not found. Type "help" for available KitCode commands. This terminal does not run system shell commands.', 'error');
      }

      nodes.statusText.textContent = 'KitCode safe terminal ready';
    }

    nodes.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const command = nodes.input.value;
      nodes.input.value = '';

      if (command.trim()) {
        history.push(command);
        historyIndex = history.length;
      }

      runCommand(command).catch(() => {
        append('Unable to reach the local KitCode tracker. Run "kitcode track" and try again.', 'error');
        nodes.statusText.textContent = 'tracker request failed';
      });
    });

    nodes.input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        nodes.input.value = history[historyIndex] ?? '';
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        nodes.input.value = history[historyIndex] ?? '';
      }
    });

    window.addEventListener('focus', () => {
      if (document.body.dataset.viewMode === 'terminal') {
        nodes.input.focus();
      }
    });
    document.addEventListener('click', () => {
      if (document.body.dataset.viewMode === 'terminal') {
        nodes.input.focus();
      }
    });

    fetchSummary()
      .then((summary) => {
        latestSummary = summary;
        renderGlance(summary);
      })
      .catch(() => {
        renderGlance(null, 'offline');
      });

    const events = new EventSource('/api/events');
    events.addEventListener('summary', (event) => {
      latestSummary = JSON.parse(event.data);
      renderGlance(latestSummary);
    });
    events.addEventListener('error', () => {
      renderGlance(latestSummary, 'reconnecting');
    });

    append('Hello, KitCoder. Type "help" to list safe KitCode commands.', 'success');
    nodes.input.focus();
  </script>
</body>
</html>`;
}
