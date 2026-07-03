export function renderMiniWindow() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KitCode Mini</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=VT323&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: dark;
      --font-sans: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
      --font-title: "VT323", ui-monospace, SFMono-Regular, monospace;
      --color-brand-bg: #0A0A0A;
      --color-brand-panel: #111111;
      --color-brand-border: #1A1A1A;
      --color-brand-matcha: #8BC34A;
      --color-brand-gray: #A6A6A6;
      --color-brand-white: #FFFFFF;
      font-family: var(--font-mono);
      background: var(--color-brand-bg);
      color: var(--color-brand-gray);
    }

    * {
      box-sizing: border-box;
    }

    body {
      min-width: 320px;
      min-height: 390px;
      margin: 0;
      overflow: hidden;
      user-select: none;
      background:
        linear-gradient(rgba(139, 195, 74, 0.035) 1px, transparent 1px),
        var(--color-brand-bg);
      background-size: 100% 28px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .window {
      width: 100vw;
      min-height: 100vh;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border: 1px solid var(--color-brand-border);
      -webkit-app-region: drag;
    }

    .window::before,
    .window::after {
      position: fixed;
      z-index: 2;
      color: var(--color-brand-matcha);
      font-size: 10px;
      line-height: 1;
      pointer-events: none;
    }

    .window::before {
      content: "+";
      top: 12px;
      left: 13px;
    }

    .window::after {
      content: "+";
      right: 13px;
      bottom: 12px;
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      color: var(--color-brand-white);
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 750;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .mark {
      width: 18px;
      height: 18px;
      border: 1px solid var(--color-brand-matcha);
      background: #071014;
      box-shadow: 0 0 18px rgba(139, 195, 74, 0.28);
      position: relative;
    }

    .mark::after {
      content: ">";
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: var(--color-brand-matcha);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
    }

    .status {
      height: 26px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 10px;
      background: var(--color-brand-panel);
      border: 1px solid var(--color-brand-border);
      color: var(--color-brand-gray);
      font-size: 10px;
      text-transform: uppercase;
      white-space: nowrap;
      -webkit-app-region: no-drag;
    }

    .dot {
      width: 7px;
      height: 7px;
      background: #6ee7a8;
      box-shadow: 0 0 16px rgba(110, 231, 168, 0.8);
    }

    .hero {
      flex: 1;
      display: grid;
      place-items: center;
      text-align: center;
      padding: 8px 0;
    }

    .ring {
      width: min(62vw, 190px);
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      background: conic-gradient(var(--color-brand-matcha) var(--progress-angle), rgba(166, 166, 166, 0.16) 0);
      box-shadow: 0 0 24px rgba(139, 195, 74, 0.18);
      position: relative;
    }

    .ring::before {
      content: "";
      position: absolute;
      inset: 9px;
      background: #080808;
      border: 1px solid var(--color-brand-border);
    }

    .metric {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .percent {
      color: var(--color-brand-white);
      font-family: var(--font-title);
      font-size: 68px;
      line-height: 1;
      font-weight: 400;
      letter-spacing: 0;
    }

    .label {
      color: var(--color-brand-gray);
      font-size: 10px;
      font-weight: 650;
      text-transform: uppercase;
    }

    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .tile {
      min-height: 64px;
      padding: 12px;
      background: #090909;
      border: 1px solid var(--color-brand-border);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.012);
    }

    .value {
      color: var(--color-brand-matcha);
      font-family: var(--font-title);
      font-size: 34px;
      line-height: 1.1;
      font-weight: 400;
    }

    .caption {
      margin-top: 5px;
      color: var(--color-brand-gray);
      font-size: 10px;
      font-weight: 650;
      text-transform: uppercase;
    }

    .message {
      min-height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 8px;
      border: 1px solid var(--color-brand-border);
      background: color-mix(in srgb, var(--color-brand-panel) 76%, transparent);
      color: var(--color-brand-gray);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
      -webkit-app-region: no-drag;
    }

    .control {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      border: 0;
      background: var(--color-brand-bg);
      border: 1px solid var(--color-brand-border);
      color: var(--color-brand-gray);
      font: inherit;
      cursor: pointer;
    }

    .control:hover {
      border-color: var(--color-brand-matcha);
      background: var(--color-brand-matcha);
      color: var(--color-brand-white);
    }
  </style>
</head>
<body>
  <main class="window">
    <section class="top">
      <div class="brand"><span class="mark"></span><span>Mini.tsx</span></div>
      <div class="controls">
        <div class="status"><span class="dot"></span><span id="statusText">Connecting</span></div>
        <button class="control" id="closeButton" type="button" title="Close">×</button>
      </div>
    </section>

    <section class="hero">
      <div class="ring" id="ring" style="--progress-angle: 0deg">
        <div class="metric">
          <div class="percent" id="percent">0%</div>
          <div class="label" id="label">break progress</div>
        </div>
      </div>
    </section>

    <section class="meta">
      <div class="tile">
        <div class="value" id="time">0m</div>
        <div class="caption">focus time</div>
      </div>
      <div class="tile">
        <div class="value" id="equals">0</div>
        <div class="caption">equal presses</div>
      </div>
    </section>

    <section class="message" id="message">tracking activity</section>
  </main>

  <script>
    const nodes = {
      ring: document.getElementById('ring'),
      percent: document.getElementById('percent'),
      label: document.getElementById('label'),
      time: document.getElementById('time'),
      equals: document.getElementById('equals'),
      message: document.getElementById('message'),
      statusText: document.getElementById('statusText'),
      closeButton: document.getElementById('closeButton'),
    };

    nodes.closeButton.addEventListener('click', () => window.close());

    function formatTime(seconds) {
      const total = Math.max(0, Math.floor(Number(seconds) || 0));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      return hours > 0 ? hours + 'h ' + minutes + 'm' : minutes + 'm';
    }

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

    function render(summary) {
      const reward = summary?.reward ?? {};
      const global = summary?.global ?? {};
      const percent = getBreakProgress(summary);
      const progress = percent / 100;
      const readyTier = (reward.tiers ?? []).find((tier) => tier.status === 'ready');
      const tracking = Number(global.trackingProjects) || 0;

      nodes.ring.style.setProperty('--progress-angle', Math.round(progress * 360) + 'deg');
      nodes.percent.textContent = percent + '%';
      nodes.time.textContent = formatTime(reward.earnedSeconds);
      nodes.equals.textContent = String(reward.totalEquals ?? 0);
      nodes.statusText.textContent = tracking > 0 ? 'Live' : 'Idle';
      nodes.label.textContent = readyTier ? 'break ready' : 'break progress';
      nodes.message.textContent = readyTier
        ? 'claim available: open dashboard'
        : reward.timeLeftSeconds > 0
          ? formatTime(reward.timeLeftSeconds) + ' until next break'
          : 'equal presses catching up';
    }

    async function refreshOnce() {
      const response = await fetch('/api/summary');
      render(await response.json());
    }

    refreshOnce().catch(() => {
      nodes.statusText.textContent = 'Offline';
      nodes.message.textContent = 'start kitcode to see live progress';
    });

    const events = new EventSource('/api/events');
    events.addEventListener('summary', (event) => {
      render(JSON.parse(event.data));
    });
    events.addEventListener('error', () => {
      nodes.statusText.textContent = 'Reconnecting';
    });
  </script>
</body>
</html>`;
}
