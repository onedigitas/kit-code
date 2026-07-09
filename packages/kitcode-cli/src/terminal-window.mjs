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
      min-width: 680px;
      min-height: 420px;
      margin: 0;
      overflow: hidden;
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      display: grid;
    }

    .terminal {
      min-width: 0;
      min-height: 0;
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      background:
        linear-gradient(180deg, rgba(252, 10, 10, 0.08), transparent 34%),
        var(--panel);
    }

    .vimline,
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

    .vimline {
      min-height: 34px;
      padding: 0 14px;
      -webkit-app-region: drag;
    }

    .terminal-close {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      margin-left: 6px;
      border: 0;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      font-size: 18px;
      line-height: 1;
      -webkit-app-region: no-drag;
    }

    .terminal-close:hover,
    .terminal-close:focus-visible {
      color: var(--text);
      background: rgba(252, 10, 10, 0.16);
      outline: none;
    }

    .statusline {
      min-height: 28px;
      padding: 0;
      border-top: 1px solid var(--line);
      border-bottom: 0;
      background: #170b0b;
      color: var(--text);
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

    .mode {
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

    .status-right {
      margin-left: auto;
      padding: 0 12px;
      color: var(--muted);
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

    .prompt-symbol {
      color: var(--primary-strong);
      font-weight: 900;
    }

    .command {
      color: var(--cyan);
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

    .muted {
      color: var(--muted);
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

    @media (max-width: 720px) {
      html,
      body {
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
<body>
  <main class="terminal" id="terminal">
    <div class="vimline" title="Drag window">
      <span class="tab" data-active="true">kitcode-terminal</span>
      <span class="tab">~/campaign</span>
      <span class="status-right">safe-shell</span>
      <button class="terminal-close" id="closeButton" type="button" title="Close" aria-label="Close">x</button>
    </div>

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
      <span class="mode">NORMAL</span>
      <span class="status-text" id="statusText">KitCode safe terminal ready</span>
      <span class="status-right">commands: help status summary rewards dashboard mini clear</span>
    </footer>
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
      '  mini       Explain how to open the mini window.',
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
    };
    const history = [];
    let historyIndex = 0;

    nodes.closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      window.close();
    });

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
        append(summarizeProgress(await fetchSummary()), 'success');
      } else if (normalized === 'rewards') {
        append(summarizeRewards(await fetchSummary()), 'success');
      } else if (normalized === 'dashboard') {
        window.open(DASHBOARD_URL, '_blank', 'noopener');
        append('Opening KitCode dashboard...', 'success');
      } else if (normalized === 'mini') {
        append('Run "kitcode mini" in your real terminal to open the mini window.', 'warning');
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

    window.addEventListener('focus', () => nodes.input.focus());
    document.addEventListener('click', () => nodes.input.focus());

    append('Hello, KitCoder. Type "help" to list safe KitCode commands.', 'success');
    nodes.input.focus();
  </script>
</body>
</html>`;
}
