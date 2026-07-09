export function renderMiniWindow() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KitCode Mini</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #090505;
      --panel: #140909;
      --border: #3a1717;
      --accent: #fc0a0a;
      --accent-strong: #ff6b6b;
      --ready: #ffd84a;
      --offline: #8f98a1;
      --text: #fff3f3;
      --muted: #b9a5a5;
      --quiet: #7a6262;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      min-width: 320px;
      min-height: 148px;
      margin: 0;
      overflow: hidden;
      background: transparent;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      display: grid;
      place-items: center;
    }

    .panel {
      width: min(100vw, 320px);
      height: min(100vh, 148px);
      display: grid;
      grid-template-rows: 38px 1fr;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(252, 10, 10, 0.16), transparent 42%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 52%),
        var(--panel);
      box-shadow:
        0 18px 44px rgba(0, 0, 0, 0.46),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      -webkit-app-region: drag;
    }

    .panel[data-state="ready"] {
      --border: rgba(255, 216, 74, 0.72);
      --accent: var(--ready);
      --accent-strong: #fff0a3;
      background:
        linear-gradient(135deg, rgba(255, 216, 74, 0.2), transparent 42%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 52%),
        var(--panel);
    }

    .panel[data-state="offline"],
    .panel[data-state="reconnecting"] {
      --border: #2f3637;
      --accent: var(--offline);
      --accent-strong: #c0c8ce;
      background:
        linear-gradient(135deg, rgba(143, 152, 161, 0.14), transparent 42%),
        #101315;
    }

    .header {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 10px 0 14px;
      -webkit-app-region: drag;
    }

    .brand {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0;
      white-space: nowrap;
    }

    .mark {
      width: 17px;
      height: 17px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border: 1px solid rgba(252, 10, 10, 0.52);
      background: rgba(252, 10, 10, 0.14);
      color: var(--accent-strong);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      font-weight: 900;
      line-height: 1;
    }

    .grip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: var(--quiet);
      -webkit-app-region: drag;
    }

    .grip::before,
    .grip::after {
      content: "";
      width: 3px;
      height: 3px;
      background: currentColor;
    }

    .window-controls {
      display: flex;
      align-items: center;
      gap: 9px;
      flex: 0 0 auto;
      -webkit-app-region: no-drag;
    }

    .state {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--accent-strong);
      font-size: 10px;
      font-weight: 800;
      line-height: 1;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .dot {
      width: 7px;
      height: 7px;
      flex: 0 0 auto;
      border-radius: 999px;
      background: currentColor;
      box-shadow: 0 0 14px currentColor;
    }

    .close {
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border: 0;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      font-size: 16px;
      line-height: 1;
      -webkit-app-region: no-drag;
    }

    .close:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.08);
    }

    .open {
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
      margin: 0;
      padding: 8px 14px 13px;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      text-align: left;
      -webkit-app-region: no-drag;
    }

    .summary {
      min-width: 0;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: end;
      gap: 13px;
    }

    .percent {
      color: var(--text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 43px;
      font-weight: 800;
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
      color: var(--accent-strong);
      font-size: 12px;
      font-weight: 800;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .hint {
      min-width: 0;
      overflow: hidden;
      color: var(--muted);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .progress {
      width: 100%;
      height: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.08);
    }

    .bar {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--accent-strong));
      box-shadow: 0 0 18px rgba(252, 10, 10, 0.34);
      transition: width 180ms ease;
    }
  </style>
</head>
<body>
  <main class="panel" id="panel" data-state="offline">
    <header class="header">
      <div class="brand">
        <span class="mark">&gt;</span>
        <span>KitCode</span>
        <span class="grip" title="Drag"></span>
      </div>
      <div class="window-controls">
        <span class="state"><span class="dot"></span><span id="statusText">Offline</span></span>
        <button class="close" id="closeButton" type="button" title="Close" aria-label="Close">x</button>
      </div>
    </header>
    <button class="open" id="openButton" type="button" title="Open KitCode dashboard">
      <span class="summary">
        <span class="percent" id="percent">0%</span>
        <span class="copy">
          <span class="label" id="label">Tracker offline</span>
          <span class="hint" id="hint">Run kitcode track</span>
        </span>
      </span>
      <span class="progress" id="progress" role="progressbar" aria-label="Break progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="bar" id="bar"></span>
      </span>
    </button>
  </main>

  <script>
    const DASHBOARD_URL = 'https://kitcode.onedigitas.com/';
    const nodes = {
      panel: document.getElementById('panel'),
      percent: document.getElementById('percent'),
      statusText: document.getElementById('statusText'),
      label: document.getElementById('label'),
      hint: document.getElementById('hint'),
      progress: document.getElementById('progress'),
      bar: document.getElementById('bar'),
      openButton: document.getElementById('openButton'),
      closeButton: document.getElementById('closeButton'),
    };

    nodes.closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      window.close();
    });

    nodes.openButton.addEventListener('click', () => {
      window.open(DASHBOARD_URL, '_blank', 'noopener');
    });

    function safePercent(current, target) {
      if (target <= 0) return current > 0 ? 100 : 0;
      return (current / target) * 100;
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

    function setState(state, status, label, hint) {
      nodes.panel.dataset.state = state;
      nodes.statusText.textContent = status;
      nodes.label.textContent = label;
      nodes.hint.textContent = hint;
    }

    function setProgress(percent) {
      const value = Math.min(100, Math.max(0, Number(percent) || 0));
      nodes.percent.textContent = value + '%';
      nodes.bar.style.width = value + '%';
      nodes.progress.setAttribute('aria-valuenow', String(value));
    }

    function render(summary) {
      const reward = summary?.reward ?? {};
      const global = summary?.global ?? {};
      const percent = getBreakProgress(summary);
      const readyTier = (reward.tiers ?? []).find((tier) => tier.status === 'ready');
      const tracking = Number(global.trackingProjects) || 0;

      setProgress(percent);

      if (readyTier) {
        setState('ready', 'ready', 'Break ready', 'Open dashboard to claim');
      } else if (tracking > 0) {
        setState('live', 'live', 'Break progress', 'Tracking your focus');
      } else {
        setState('idle', 'idle', 'No project active', 'Run kitcode add');
      }
    }

    async function refreshOnce() {
      const response = await fetch('/api/summary');
      render(await response.json());
    }

    refreshOnce().catch(() => {
      setProgress(0);
      setState('offline', 'offline', 'Tracker offline', 'Run kitcode track');
    });

    const events = new EventSource('/api/events');
    events.addEventListener('summary', (event) => {
      render(JSON.parse(event.data));
    });
    events.addEventListener('error', () => {
      setState('reconnecting', 'sync', 'Reconnecting', 'Waiting for tracker');
    });
  </script>
</body>
</html>`;
}
