import {
  renderPlatformChrome,
  resolveSetupPlatform,
  setupPlatformTheme,
} from './onboarding-platform.mjs';

export function renderOnboardingWindow(platform = resolveSetupPlatform()) {
  const theme = setupPlatformTheme(platform);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KitCode Setup</title>
  <style>
    @font-face {
      font-family: 'Departure Mono';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2409-1@1.0/DepartureMono-Regular.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }

    :root {
      color-scheme: dark;
      --bg: #000000;
      --panel: #0b0909;
      --line: rgba(252, 10, 10, 0.28);
      --line-strong: rgba(252, 10, 10, 0.5);
      --primary: #fc0a0a;
      --primary-strong: #fc0a0a;
      --text: #f2f0ea;
      --muted: rgba(242, 240, 234, 0.62);
      --dim: rgba(242, 240, 234, 0.42);
      --error: #ff9d9d;
      --font-gateway: "Departure Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-gateway);
    }

    * { box-sizing: border-box; }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: transparent;
      color: var(--text);
      font: 13px/1.4 var(--font-gateway);
      -webkit-font-smoothing: antialiased;
    }

    button,
    input { font: inherit; }

    .shell {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) 29px;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      background:
        linear-gradient(180deg, rgba(252, 10, 10, 0.1), transparent 36%),
        var(--panel);
      box-shadow: 0 0 1px rgba(252, 10, 10, 0.4), 0 0 28px rgba(252, 10, 10, 0.12);
    }

    .chrome,
    .statusline {
      display: flex;
      align-items: center;
      min-width: 0;
      background: rgba(0, 0, 0, 0.86);
      color: var(--muted);
      font-size: 11px;
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .chrome {
      position: relative;
      justify-content: space-between;
      gap: 12px;
      min-height: 36px;
      border-bottom: 1px solid var(--line);
      -webkit-app-region: drag;
    }

    .chrome-macos {
      min-height: 40px;
      padding: 0 14px 0 78px;
    }

    .chrome-windows {
      min-height: 36px;
      padding-left: 14px;
      padding-right: 0;
    }

    .chrome-linux {
      min-height: 36px;
      padding: 0 4px 0 14px;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 0 1 auto;
    }

    .brand-icon {
      display: grid;
      grid-template-columns: repeat(2, 4px);
      gap: 3px;
      flex: 0 0 auto;
    }

    .brand-icon span {
      width: 4px;
      height: 4px;
      background: var(--primary);
    }

    .header-title {
      color: var(--text);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin-left: auto;
      -webkit-app-region: no-drag;
    }

    .safe-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      flex: 0 0 auto;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 6px rgba(252, 10, 10, 0.75);
    }

    .window-controls {
      display: inline-flex;
      align-items: center;
      align-self: stretch;
      flex: 0 0 auto;
      gap: 0;
      -webkit-app-region: no-drag;
    }

    .window-controls-windows {
      margin-left: 0;
    }

    .close-button {
      width: 34px;
      height: 100%;
      min-height: 36px;
      margin-left: 0;
      border: 0;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      -webkit-app-region: no-drag;
    }

    .close-button-macos {
      position: absolute;
      left: 14px;
      top: 50%;
      width: 54px;
      height: 24px;
      min-height: 0;
      margin: 0;
      transform: translateY(-50%);
      opacity: 0;
    }

    .close-button-windows,
    .close-button-linux {
      width: 46px;
      font-size: 12px;
    }

    .window-control {
      width: 46px;
      height: 100%;
      min-height: 36px;
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: 11px;
      -webkit-app-region: no-drag;
    }

    .close-button:hover,
    .close-button:focus-visible,
    .window-control:hover,
    .window-control:focus-visible {
      outline: 1px solid var(--primary);
      outline-offset: -4px;
      color: var(--text);
    }

    .close-button-windows:hover,
    .close-button-windows:focus-visible {
      background: #e81123;
      outline: 0;
      color: #fff;
    }

    .workspace {
      min-height: 0;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.35);
    }

    .steps-panel {
      position: relative;
      min-height: 0;
      display: grid;
      grid-template-columns: 168px minmax(0, 1fr);
      grid-template-rows: auto 1px minmax(0, 1fr) 1px auto;
      overflow: hidden;
    }

    .rail-track {
      position: absolute;
      left: 27px;
      top: 44px;
      bottom: 16px;
      width: 1px;
      background: rgba(242, 240, 234, 0.14);
      pointer-events: none;
      z-index: 0;
    }

    .rail-cell {
      position: relative;
      min-width: 0;
      padding: 16px 12px 16px 14px;
      border-right: 1px solid var(--line);
    }

    .content-cell {
      min-width: 0;
      min-height: 0;
      padding: 16px 16px;
    }

    .tracking-row { grid-row: 1; }
    .divider-after-tracking { grid-row: 2; }
    .projects-row { grid-row: 3; min-height: 0; align-self: stretch; }
    .divider-after-projects { grid-row: 4; }
    .companion-row { grid-row: 5; }

    .projects-row.content-cell {
      display: flex;
      flex-direction: column;
    }

    .section-divider {
      grid-column: 1 / -1;
      height: 0;
      margin: 0;
      border: 0;
      border-top: 1px solid var(--line);
    }

    .rail-item {
      position: relative;
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr);
      gap: 8px;
      align-items: start;
      color: var(--dim);
    }

    .rail-item.is-active { color: var(--text); }

    .rail-badge {
      position: relative;
      z-index: 1;
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(242, 240, 234, 0.22);
      border-radius: 50%;
      background: var(--bg);
      color: inherit;
      font-size: 10px;
      font-weight: 700;
    }

    .rail-item.is-active .rail-badge {
      border-color: var(--primary);
      background: var(--primary);
      color: #0b0909;
    }

    .rail-label {
      padding-top: 5px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      line-height: 1.35;
    }

    .section-title,
    .project-count,
    .project-meta,
    .hint {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .section-title {
      margin: 0 0 8px;
      color: var(--text);
      font-size: 12px;
      letter-spacing: 0.04em;
      text-transform: none;
    }

    .project-count { color: var(--primary); }

    .step {
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    .step-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .step-head .section-title { margin-bottom: 0; }

    .project-count { margin-left: auto; }

    .hint {
      margin: 0;
      color: var(--muted);
      text-transform: none;
      letter-spacing: 0.04em;
    }

    .option-group {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .option { position: relative; min-width: 0; }

    .option input {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .option-card {
      min-height: 35px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border: 1px solid rgba(242, 240, 234, 0.22);
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      user-select: none;
      transition: background 140ms ease, color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }

    .option input:checked + .option-card {
      border-color: var(--primary);
      background: rgba(252, 10, 10, 0.08);
      color: var(--text);
      box-shadow: inset 0 0 14px rgba(252, 10, 10, 0.18), 0 0 10px rgba(252, 10, 10, 0.12);
    }

    .option input:focus-visible + .option-card {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .option-mark {
      flex: 0 0 auto;
      color: var(--primary);
      font-weight: 700;
    }

    .option-copy { font-weight: 700; }

    .projects-step {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .project-list {
      flex: 1 1 auto;
      min-height: 72px;
      overflow: auto;
      border: 1px solid var(--line);
      background: rgba(0, 0, 0, 0.55);
      scrollbar-color: var(--line-strong) var(--bg);
    }

    .project-list.is-empty {
      border-style: dashed;
      border-color: rgba(242, 240, 234, 0.22);
      background: rgba(0, 0, 0, 0.35);
    }

    .empty-state {
      height: 100%;
      min-height: 88px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      color: var(--dim);
      font-size: 11px;
      text-align: center;
    }

    .empty-icon {
      display: inline-flex;
      color: var(--dim);
    }

    .project-row {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 9px;
      min-height: 38px;
      padding: 5px 8px 5px 10px;
      border-bottom: 1px solid var(--line);
    }

    .project-row:last-child { border-bottom: 0; }
    .project-row[data-kind="pending"] { background: rgba(252, 10, 10, 0.055); }

    .project-copy { min-width: 0; }

    .project-name,
    .project-path {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .project-name { color: var(--text); font-weight: 700; }
    .project-path { color: var(--dim); font-size: 10px; }
    .project-meta { color: var(--muted); }
    .project-row[data-kind="pending"] .project-meta { color: var(--primary); }

    .remove-project,
    .terminal-button {
      border: 1px solid rgba(242, 240, 234, 0.22);
      background: transparent;
      color: var(--text);
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 0.04em;
      -webkit-app-region: no-drag;
      transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
    }

    .remove-project {
      width: 25px;
      height: 25px;
      padding: 0;
      color: var(--muted);
    }

    .remove-project:hover,
    .remove-project:focus-visible,
    .terminal-button:hover,
    .terminal-button:focus-visible {
      border-color: var(--primary);
      background: var(--primary);
      outline: none;
      color: #0b0909;
    }

    .project-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 7px;
    }

    #pickFolders {
      flex: 0 0 190px;
      white-space: nowrap;
      border-color: var(--primary);
      color: var(--primary);
    }

    #pickFolders:hover,
    #pickFolders:focus-visible {
      color: #0b0909;
    }

    .terminal-button {
      min-height: 34px;
      padding: 7px 11px;
    }

    .primary-button {
      min-width: 194px;
      border-color: var(--primary);
      background: var(--primary);
      color: #0b0909;
      white-space: nowrap;
      text-transform: none;
      letter-spacing: 0.02em;
    }

    .primary-button:hover,
    .primary-button:focus-visible { color: #0b0909; }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.48;
    }

    .content-footer {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      min-width: 0;
      padding: 12px 16px;
      border-top: 1px solid var(--line);
      background: rgba(0, 0, 0, 0.45);
    }

    .message {
      min-width: 0;
      min-height: 18px;
      overflow: hidden;
      color: var(--muted);
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message[data-state="error"] { color: var(--error); }
    .message[data-state="success"] { color: var(--primary); }

    .status-text[data-state="error"] { color: var(--error); }
    .status-text[data-state="success"] { color: var(--primary); }

    .statusline {
      border-top: 1px solid var(--line-strong);
      background: rgba(0, 0, 0, 0.86);
      color: var(--text);
    }

    .normal-mode {
      align-self: stretch;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      background: var(--primary);
      color: #0b0909;
      font-weight: 700;
      letter-spacing: 0.1em;
    }

    .status-text {
      min-width: 0;
      overflow: hidden;
      padding: 0 10px;
      text-overflow: ellipsis;
    }

    .keyboard-hint {
      margin-left: auto;
      padding-right: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body data-platform="${theme.id}" data-theme-marker="${theme.marker}">
  <main class="shell" data-testid="setup-shell">
    ${renderPlatformChrome(theme)}

    <div class="workspace" id="setupContent" data-testid="setup-step-rail">
      <div class="steps-panel">
      <span class="rail-track" aria-hidden="true"></span>

      <div class="rail-cell tracking-row">
        <div class="rail-item is-active" data-step="tracking" data-testid="setup-rail-tracking">
          <span class="rail-badge">01</span>
          <span class="rail-label">START TRACKING AFTER SETUP</span>
        </div>
      </div>
      <div class="content-cell tracking-row">
        <fieldset class="step" id="trackingStep" data-setup-step="tracking">
          <legend class="section-title">Start tracking after setup?</legend>
          <div class="option-group" id="autoTrackGroup" role="radiogroup" aria-label="Start tracking after setup" data-next-focus="pickFolders">
            <label class="option">
              <input type="radio" name="autoTrack" value="yes" checked data-testid="auto-track-yes">
              <span class="option-card"><span class="option-mark">[x]</span><span class="option-copy">YES</span></span>
            </label>
            <label class="option">
              <input type="radio" name="autoTrack" value="no" data-testid="auto-track-no">
              <span class="option-card"><span class="option-mark">[ ]</span><span class="option-copy">NO</span></span>
            </label>
          </div>
        </fieldset>
      </div>
      <hr class="section-divider divider-after-tracking" aria-hidden="true">

      <div class="rail-cell projects-row">
        <div class="rail-item" data-step="projects" data-testid="setup-rail-projects">
          <span class="rail-badge">02</span>
          <span class="rail-label">PROJECTS</span>
        </div>
      </div>
      <div class="content-cell projects-row">
        <section class="step projects-step" aria-labelledby="projectsTitle" data-setup-step="projects">
          <div class="step-head">
            <h2 class="section-title" id="projectsTitle">Select one or more local folders</h2>
            <span class="project-count" id="projectCount">0 ADDED</span>
          </div>
          <div class="project-list is-empty" id="projectList" role="list" aria-label="KitCode projects" data-testid="project-list"></div>
          <div class="project-actions">
            <button class="terminal-button" id="pickFolders" type="button" data-testid="add-projects">+ ADD PROJECTS</button>
            <p class="hint">Existing files become the baseline.<br>Source and diffs stay local.</p>
          </div>
        </section>
      </div>
      <hr class="section-divider divider-after-projects" aria-hidden="true">

      <div class="rail-cell companion-row">
        <div class="rail-item" data-step="companion" data-testid="setup-rail-companion">
          <span class="rail-badge">03</span>
          <span class="rail-label">COMPANION VIEW</span>
        </div>
      </div>
      <div class="content-cell companion-row">
        <fieldset class="step" data-setup-step="companion">
          <legend class="section-title">Choose companion view</legend>
          <div class="option-group" id="companionGroup" role="radiogroup" aria-label="Companion view" data-next-focus="saveButton">
            <label class="option">
              <input type="radio" name="companionView" value="mini" checked data-testid="companion-mini">
              <span class="option-card"><span class="option-mark">[x]</span><span class="option-copy">MINI</span></span>
            </label>
            <label class="option">
              <input type="radio" name="companionView" value="pet" data-testid="companion-pet">
              <span class="option-card"><span class="option-mark">[ ]</span><span class="option-copy">PET</span></span>
            </label>
          </div>
        </fieldset>
      </div>
      </div>

      <footer class="content-footer">
        <div class="message" id="message" aria-live="polite">Add one or more projects to continue.</div>
        <button class="terminal-button primary-button" id="saveButton" type="button" data-testid="save-setup">Save &amp; Open KitCode &rarr;</button>
      </footer>
    </div>

    <footer class="statusline">
      <span class="normal-mode">NORMAL</span>
      <span class="status-text" id="statusText" aria-live="polite">setup:ready</span>
      <span class="keyboard-hint">↑↓ move · space select · enter continue</span>
    </footer>
  </main>

  <script>
    const bridge = window.kitcodeOnboarding;
    const projectList = document.getElementById('projectList');
    const projectCount = document.getElementById('projectCount');
    const message = document.getElementById('message');
    const statusText = document.getElementById('statusText');
    const pickFolders = document.getElementById('pickFolders');
    const saveButton = document.getElementById('saveButton');
    const setupContent = document.getElementById('setupContent');
    const railItems = [...document.querySelectorAll('.rail-item')];
    const stepSections = [...document.querySelectorAll('[data-setup-step]')];
    const SAVE_LABEL = 'Save & Open KitCode \u2192';
    const FOLDER_ICON = '<svg class="empty-icon" width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true"><path d="M1 4.5C1 3.12 2.12 2 3.5 2H8.17L10 4.5H18.5C19.88 4.5 21 5.62 21 7V15.5C21 16.88 19.88 18 18.5 18H3.5C2.12 18 1 16.88 1 15.5V4.5Z" stroke="currentColor" stroke-width="1.2"/></svg>';
    let persistedProjects = [];
    let pendingProjects = [];
    let saving = false;

    function projectName(project) {
      const parts = String(project.repoRoot || '').split(/[\\\\/]/).filter(Boolean);
      return parts[parts.length - 1] || project.repoRoot || 'project';
    }

    function knownProjectIds() {
      return new Set(persistedProjects.concat(pendingProjects).map((project) => project.id));
    }

    function setFeedback(text, state, status) {
      message.textContent = text;
      message.dataset.state = state || 'normal';
      statusText.textContent = status || 'setup:ready';
      statusText.dataset.state = state || 'normal';
    }

    function setActiveRailStep(stepId) {
      if (!stepId) return;
      railItems.forEach((item) => {
        item.classList.toggle('is-active', item.dataset.step === stepId);
      });
    }

    function bindStepRailSpy() {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
        if (visible[0]) {
          setActiveRailStep(visible[0].target.dataset.setupStep);
        }
      }, {
        root: setupContent,
        threshold: [0.35, 0.55, 0.75],
      });

      stepSections.forEach((section) => observer.observe(section));
      setupContent.addEventListener('focusin', (event) => {
        const section = event.target.closest('[data-setup-step]');
        if (section) setActiveRailStep(section.dataset.setupStep);
      });
    }

    function createProjectRow(project, kind) {
      const row = document.createElement('div');
      const copy = document.createElement('div');
      const name = document.createElement('span');
      const path = document.createElement('span');
      const meta = document.createElement('span');
      const remove = document.createElement('button');

      row.className = 'project-row';
      row.dataset.kind = kind;
      row.dataset.testid = kind === 'pending' ? 'pending-project-row' : 'persisted-project-row';
      row.setAttribute('role', 'listitem');
      row.title = project.repoRoot;
      copy.className = 'project-copy';
      name.className = 'project-name';
      name.textContent = projectName(project);
      path.className = 'project-path';
      path.textContent = project.repoRoot;
      meta.className = 'project-meta';
      meta.textContent = (project.sourceType || 'vibe').toUpperCase() + ' · ' + (kind === 'pending' ? 'PENDING' : 'TRACKED');
      copy.append(name, path);
      row.append(copy, meta);

      remove.className = 'remove-project';
      remove.type = 'button';
      remove.dataset.testid = 'remove-project';
      remove.textContent = 'x';
      remove.title = 'Remove project';
      remove.setAttribute('aria-label', 'Remove ' + projectName(project));
      remove.addEventListener('click', async () => {
        if (kind === 'pending') {
          pendingProjects = pendingProjects.filter((candidate) => candidate.id !== project.id);
          renderProjects();
          setFeedback('Project removed.', 'normal', 'projects:removed');
          return;
        }

        if (!bridge?.removeProject) {
          persistedProjects = persistedProjects.filter((candidate) => candidate.id !== project.id);
          renderProjects();
          setFeedback('Project removed from this setup.', 'normal', 'projects:removed');
          return;
        }

        remove.disabled = true;
        try {
          const result = await bridge.removeProject(project.id);
          if (!result.ok) {
            remove.disabled = false;
            setFeedback(result.error || 'Project could not be removed.', 'error', 'error:remove-project');
            return;
          }
          persistedProjects = Array.isArray(result.projects)
            ? result.projects
            : persistedProjects.filter((candidate) => candidate.id !== project.id);
          renderProjects();
          setFeedback('Project removed.', 'normal', 'projects:removed');
        } catch {
          remove.disabled = false;
          setFeedback('Project could not be removed. Try again.', 'error', 'error:remove-project');
        }
      });
      row.append(remove);

      return row;
    }

    function renderProjects() {
      projectList.textContent = '';
      const projects = persistedProjects.concat(pendingProjects);
      projectCount.textContent = projects.length + ' ADDED';
      projectList.classList.toggle('is-empty', !projects.length);

      if (!projects.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = FOLDER_ICON + '<span>No projects added</span>';
        projectList.append(empty);
        return;
      }

      persistedProjects.forEach((project) => projectList.append(createProjectRow(project, 'persisted')));
      pendingProjects.forEach((project) => projectList.append(createProjectRow(project, 'pending')));
    }

    function syncOptionGroup(group) {
      const radios = [...group.querySelectorAll('input[type="radio"]')];
      radios.forEach((radio) => {
        const mark = radio.nextElementSibling.querySelector('.option-mark');
        mark.textContent = radio.checked ? '[x]' : '[ ]';
        radio.setAttribute('aria-checked', String(radio.checked));
        if (document.activeElement !== radio) radio.tabIndex = radio.checked ? 0 : -1;
      });
    }

    function focusNextSection(group) {
      const next = document.getElementById(group.dataset.nextFocus);
      if (next) next.focus();
    }

    function bindOptionGroup(group) {
      const radios = [...group.querySelectorAll('input[type="radio"]')];
      radios.forEach((radio) => radio.addEventListener('change', () => syncOptionGroup(group)));
      group.addEventListener('keydown', (event) => {
        if (!radios.includes(event.target)) return;
        const index = radios.indexOf(event.target);

        if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
          const next = radios[(index + delta + radios.length) % radios.length];
          radios.forEach((radio) => { radio.tabIndex = -1; });
          next.tabIndex = 0;
          next.focus();
          statusText.textContent = 'select:space-or-enter';
          return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          event.target.checked = true;
          event.target.dispatchEvent(new Event('change', {bubbles: true}));
          if (event.key === 'Enter') focusNextSection(group);
        }
      });
      syncOptionGroup(group);
    }

    function setBusy(busy) {
      saving = busy;
      pickFolders.disabled = busy;
      saveButton.disabled = busy;
      document.querySelectorAll('.option input, .remove-project').forEach((control) => { control.disabled = busy; });
    }

    bindOptionGroup(document.getElementById('autoTrackGroup'));
    bindOptionGroup(document.getElementById('companionGroup'));
    bindStepRailSpy();
    renderProjects();

    pickFolders.addEventListener('click', async () => {
      setFeedback('Opening the native multi-folder picker...', 'normal', 'projects:select');
      try {
        const result = await bridge.selectFolders();
        if (result.canceled) {
          setFeedback('Project selection canceled.', 'normal', 'projects:unchanged');
          return;
        }

        const known = knownProjectIds();
        let duplicates = 0;
        for (const project of result.projects || []) {
          if (known.has(project.id)) {
            duplicates += 1;
            continue;
          }
          known.add(project.id);
          pendingProjects.push(project);
        }
        renderProjects();
        const added = (result.projects || []).length - duplicates;
        setFeedback(
          added ? added + ' project' + (added === 1 ? '' : 's') + ' ready to add.' : 'Those projects are already added.',
          'normal',
          duplicates ? 'projects:deduplicated' : 'projects:pending'
        );
      } catch {
        setFeedback('Folder picker could not open. Restart setup and try again.', 'error', 'error:folder-picker');
      }
    });

    saveButton.addEventListener('click', async () => {
      if (saving) return;
      if (!persistedProjects.length && !pendingProjects.length) {
        setFeedback('Add at least one readable project folder.', 'error', 'error:no-projects');
        pickFolders.focus();
        return;
      }

      setBusy(true);
      saveButton.textContent = 'Saving...';
      setFeedback('Saving projects and preferences...', 'normal', 'setup:save');
      const autoTrack = document.querySelector('input[name="autoTrack"]:checked').value === 'yes';
      const companionView = document.querySelector('input[name="companionView"]:checked').value;

      try {
        const result = await bridge.submit({
          folders: pendingProjects.map((project) => project.repoRoot),
          autoTrack,
          companionView,
        });

        if (Array.isArray(result.projects)) {
          persistedProjects = result.projects;
          const persistedIds = new Set(persistedProjects.map((project) => project.id));
          pendingProjects = pendingProjects.filter((project) => !persistedIds.has(project.id));
          renderProjects();
        }

        if (!result.ok) {
          setBusy(false);
          saveButton.textContent = 'Retry Save';
          setFeedback(result.error || 'Setup could not be saved.', 'error', 'error:retry-available');
          return;
        }

        saveButton.textContent = 'Setup Complete';
        setFeedback('Setup complete. Opening KitCode companion...', 'success', 'setup:complete');
      } catch {
        setBusy(false);
        saveButton.textContent = 'Retry Save';
        setFeedback('Setup request failed. Your selections are still here.', 'error', 'error:retry-available');
      }
    });

    if (!bridge) {
      setBusy(true);
      setFeedback('KitCode setup bridge is unavailable. Close this window and run kitcode setup again.', 'error', 'error:preload');
    } else {
      document.getElementById('closeButton').addEventListener('click', () => bridge.close());
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !saving) bridge.close();
      });

      bridge.initialState().then((state) => {
        persistedProjects = Array.isArray(state.projects) ? state.projects : [];
        const known = knownProjectIds();
        let suggestedCount = 0;

        for (const project of state.suggestedProjects || []) {
          if (known.has(project.id)) {
            continue;
          }
          known.add(project.id);
          pendingProjects.push(project);
          suggestedCount += 1;
        }

        document.querySelector('input[name="autoTrack"][value="' + (state.autoTrack === false ? 'no' : 'yes') + '"]').checked = true;
        document.querySelector('input[name="companionView"][value="' + (state.companionView === 'pet' ? 'pet' : 'mini') + '"]').checked = true;
        document.querySelectorAll('.option-group').forEach(syncOptionGroup);
        renderProjects();

        if (suggestedCount) {
          setFeedback(
            suggestedCount + ' project folder' + (suggestedCount === 1 ? '' : 's') + ' added from your chat. Review and save to continue.',
            'normal',
            'projects:chat-suggested'
          );
        } else {
          setFeedback(
            persistedProjects.length ? persistedProjects.length + ' tracked project' + (persistedProjects.length === 1 ? '' : 's') + ' loaded.' : 'Add one or more projects to continue.',
            'normal',
            persistedProjects.length ? 'projects:loaded' : 'setup:ready'
          );
        }
      }).catch(() => {
        renderProjects();
        setFeedback('Local setup state could not be loaded. Restart setup and try again.', 'error', 'error:initial-state');
      });
    }
  </script>
</body>
</html>`;
}
