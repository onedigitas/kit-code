import {
  platformThemeCss,
  renderPlatformChrome,
  renderPlatformStatus,
  resolveSetupPlatform,
  setupPlatformTheme,
} from './onboarding-platform.mjs';

function sharedLayoutCss() {
  return `
    * { box-sizing: border-box; }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: transparent;
      color: var(--text);
      font: 13px/1.45 var(--font-stack);
      -webkit-font-smoothing: antialiased;
    }

    button,
    input { font: inherit; }

    .shell {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      border-radius: var(--shell-radius);
      background: var(--panel);
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
    }

    .chrome,
    .statusline {
      display: flex;
      align-items: center;
      min-width: 0;
      background: var(--chrome);
      color: var(--muted);
      font-size: 12px;
      white-space: nowrap;
    }

    .chrome {
      min-height: 38px;
      padding: 0 10px;
      gap: 10px;
      border-bottom: 1px solid var(--line);
      -webkit-app-region: drag;
    }

    .chrome-macos {
      min-height: 44px;
      padding: 0 14px;
      justify-content: center;
      position: relative;
    }

    .chrome-windows {
      min-height: 36px;
      padding-left: 12px;
    }

    .chrome-linux {
      min-height: 42px;
      padding: 0 14px;
      gap: 8px;
    }

    .window-controls {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      -webkit-app-region: no-drag;
    }

    .window-controls-macos {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      gap: 7px;
    }

    .window-controls-windows {
      margin-left: auto;
      gap: 0;
    }

    .traffic-light {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.18);
    }

    .traffic-close { background: #ff5f57; }
    .traffic-minimize { background: #febc2e; }
    .traffic-maximize { background: #28c840; }

    .chrome-icon {
      width: 18px;
      height: 18px;
      display: inline-grid;
      place-items: center;
      border-radius: 4px;
      background: var(--primary);
      color: var(--save-text);
      font-size: 9px;
      font-weight: 800;
      -webkit-app-region: no-drag;
    }

    .chrome-title {
      color: var(--chrome-text);
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .chrome-macos .chrome-title {
      font-size: 13px;
    }

    .chrome-subtitle {
      margin-left: auto;
      color: var(--muted);
      font-size: 11px;
      -webkit-app-region: no-drag;
    }

    .chrome-macos .chrome-subtitle {
      position: absolute;
      right: 14px;
    }

    .close-button {
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
      width: 52px;
      height: 24px;
      transform: translateY(-50%);
      opacity: 0;
    }

    .close-button-windows,
    .close-button-linux {
      width: 46px;
      height: 32px;
      font-size: 12px;
    }

    .window-control {
      width: 46px;
      height: 32px;
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
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
      outline: none;
    }

    .close-button-windows:hover,
    .close-button-windows:focus-visible {
      background: #e81123;
      color: #fff;
    }

    .content {
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr) auto auto;
      gap: 12px;
      padding: 18px 22px 14px;
    }

    .intro { min-width: 0; }

    .eyebrow,
    .step-title,
    .project-count,
    .project-meta,
    .hint {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .eyebrow { color: var(--muted); }

    .step-title,
    .project-count { color: var(--text); }

    h1 {
      margin: 4px 0 6px;
      color: var(--text);
      font-size: 24px;
      line-height: 1.1;
      letter-spacing: -0.03em;
      font-weight: 700;
    }

    .lead,
    .hint { margin: 0; color: var(--muted); }

    .step {
      min-width: 0;
      margin: 0;
      padding: 10px 0 0;
      border: 0;
      border-top: 1px solid var(--line);
    }

    .step-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .project-count { margin-left: auto; color: var(--muted); }

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
      min-height: 38px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--option-bg);
      color: var(--muted);
      cursor: pointer;
      user-select: none;
      transition: border-color 120ms ease, background 120ms ease;
    }

    .option input:checked + .option-card {
      border-color: var(--option-focus);
      background: var(--option-selected);
      color: var(--text);
    }

    .option input:focus-visible + .option-card {
      outline: 2px solid var(--option-focus);
      outline-offset: 2px;
    }

    .option-mark {
      flex: 0 0 16px;
      width: 16px;
      height: 16px;
      border: 2px solid var(--line-strong);
      border-radius: 50%;
      background: transparent;
      position: relative;
    }

    .option input:checked + .option-card .option-mark {
      border-color: var(--option-focus);
    }

    .option input:checked + .option-card .option-mark::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: var(--option-focus);
    }

    .option-copy { font-weight: 600; }

    .projects-step {
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(72px, 1fr) auto;
    }

    .project-list {
      min-height: 72px;
      overflow: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.16);
      scrollbar-color: var(--line-strong) var(--bg);
    }

    .empty-state {
      min-height: 70px;
      display: grid;
      place-items: center;
      padding: 12px;
      color: var(--dim);
      font-size: 12px;
      text-align: center;
    }

    .project-row {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 9px;
      min-height: 40px;
      padding: 6px 10px;
      border-bottom: 1px solid var(--line);
    }

    .project-row:last-child { border-bottom: 0; }
    .project-row[data-kind="pending"] { background: var(--option-selected); }

    .project-copy { min-width: 0; }

    .project-name,
    .project-path {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .project-name { color: var(--text); font-weight: 600; }
    .project-path { color: var(--dim); font-size: 11px; }
    .project-meta { color: var(--muted); font-size: 10px; text-transform: uppercase; }
    .project-row[data-kind="pending"] .project-meta { color: var(--option-focus); }

    .remove-pending,
    .action-button {
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      background: var(--option-bg);
      color: var(--text);
      cursor: pointer;
      font-weight: 600;
      -webkit-app-region: no-drag;
    }

    .remove-pending {
      width: 28px;
      height: 28px;
      padding: 0;
      color: var(--muted);
      border-radius: 6px;
    }

    .remove-pending:hover,
    .remove-pending:focus-visible,
    .action-button:hover,
    .action-button:focus-visible {
      border-color: var(--option-focus);
      outline: 1px solid var(--option-focus);
      outline-offset: 2px;
      color: var(--text);
    }

    .project-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 8px;
    }

    #pickFolders {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .action-button {
      min-height: 34px;
      padding: 7px 12px;
    }

    .primary-button {
      min-width: 194px;
      border-color: var(--primary);
      background: var(--primary);
      color: var(--save-text);
      white-space: nowrap;
    }

    .primary-button:hover,
    .primary-button:focus-visible { color: var(--save-text); }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.48;
    }

    .actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
    }

    .message {
      min-width: 0;
      min-height: 18px;
      overflow: hidden;
      color: var(--muted);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message[data-state="error"] { color: var(--error); }
    .message[data-state="success"] { color: var(--primary-strong); }

    .statusline {
      min-height: 30px;
      border-top: 1px solid var(--line);
      background: var(--status-bg);
      color: var(--text);
      font-size: 11px;
    }

    .status-badge {
      align-self: stretch;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      background: var(--accent);
      color: var(--status-label);
      font-weight: 700;
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

    body[data-platform="darwin"] .option-card { border-radius: 10px; }
    body[data-platform="win32"] .option-card,
    body[data-platform="win32"] .action-button,
    body[data-platform="win32"] .project-list { border-radius: 4px; }
    body[data-platform="linux"] .chrome-linux .chrome-title { font-weight: 700; }
  `;
}

export function renderOnboardingWindow(platform = resolveSetupPlatform()) {
  const theme = setupPlatformTheme(platform);
  const copy = theme.copy;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${copy.title}</title>
  <style>
    ${platformThemeCss(theme)}
    ${sharedLayoutCss()}
  </style>
</head>
<body data-platform="${theme.id}" data-theme-marker="${theme.marker}">
  <main class="shell" data-testid="setup-shell">
    ${renderPlatformChrome(theme)}

    <section class="content">
      <header class="intro">
        <span class="eyebrow">${copy.eyebrow}</span>
        <h1>${copy.heading}</h1>
        <p class="lead">${copy.lead}</p>
      </header>

      <fieldset class="step" id="trackingStep">
        <legend class="step-title">${copy.trackingStep}</legend>
        <div class="option-group" id="autoTrackGroup" role="radiogroup" aria-label="Start tracking after setup" data-next-focus="pickFolders">
          <label class="option">
            <input type="radio" name="autoTrack" value="yes" checked data-testid="auto-track-yes">
            <span class="option-card"><span class="option-mark" aria-hidden="true"></span><span class="option-copy">Yes</span></span>
          </label>
          <label class="option">
            <input type="radio" name="autoTrack" value="no" data-testid="auto-track-no">
            <span class="option-card"><span class="option-mark" aria-hidden="true"></span><span class="option-copy">No</span></span>
          </label>
        </div>
      </fieldset>

      <section class="step projects-step" aria-labelledby="projectsTitle">
        <div class="step-head">
          <span class="step-title" id="projectsTitle">${copy.projectsStep}</span>
          <span class="project-count" id="projectCount">0 added</span>
        </div>
        <div class="project-list" id="projectList" role="list" aria-label="KitCode projects" data-testid="project-list"></div>
        <div class="project-actions">
          <button class="action-button" id="pickFolders" type="button" data-testid="add-projects">${copy.addProjects}</button>
          <p class="hint">${copy.hint}</p>
        </div>
      </section>

      <fieldset class="step">
        <legend class="step-title">${copy.companionStep}</legend>
        <div class="option-group" id="companionGroup" role="radiogroup" aria-label="Companion view" data-next-focus="saveButton">
          <label class="option">
            <input type="radio" name="companionView" value="mini" checked data-testid="companion-mini">
            <span class="option-card"><span class="option-mark" aria-hidden="true"></span><span class="option-copy">Mini</span></span>
          </label>
          <label class="option">
            <input type="radio" name="companionView" value="pet" data-testid="companion-pet">
            <span class="option-card"><span class="option-mark" aria-hidden="true"></span><span class="option-copy">Pet</span></span>
          </label>
        </div>
      </fieldset>

      <div class="actions">
        <div class="message" id="message" aria-live="polite">Ready to configure KitCode.</div>
        <button class="action-button primary-button" id="saveButton" type="button" data-testid="save-setup">${copy.save}</button>
      </div>
    </section>

    ${renderPlatformStatus(theme)}
  </main>

  <script>
    const bridge = window.kitcodeOnboarding;
    const projectList = document.getElementById('projectList');
    const projectCount = document.getElementById('projectCount');
    const message = document.getElementById('message');
    const statusText = document.getElementById('statusText');
    const pickFolders = document.getElementById('pickFolders');
    const saveButton = document.getElementById('saveButton');
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
    }

    function createProjectRow(project, kind) {
      const row = document.createElement('div');
      const copy = document.createElement('div');
      const name = document.createElement('span');
      const path = document.createElement('span');
      const meta = document.createElement('span');

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
      meta.textContent = (project.sourceType || 'vibe') + ' · ' + (kind === 'pending' ? 'pending' : 'tracked');
      copy.append(name, path);
      row.append(copy, meta);

      if (kind === 'pending') {
        const remove = document.createElement('button');
        remove.className = 'remove-pending';
        remove.type = 'button';
        remove.dataset.testid = 'remove-pending-project';
        remove.textContent = 'x';
        remove.title = 'Remove pending project';
        remove.setAttribute('aria-label', 'Remove ' + projectName(project) + ' from pending projects');
        remove.addEventListener('click', () => {
          pendingProjects = pendingProjects.filter((candidate) => candidate.id !== project.id);
          renderProjects();
          setFeedback('Pending project removed. Saved projects were not changed.', 'normal', 'projects:pending-removed');
        });
        row.append(remove);
      }

      return row;
    }

    function renderProjects() {
      projectList.textContent = '';
      const projects = persistedProjects.concat(pendingProjects);
      projectCount.textContent = projects.length + ' added';

      if (!projects.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = ${JSON.stringify(copy.emptyProjects)};
        projectList.append(empty);
        return;
      }

      persistedProjects.forEach((project) => projectList.append(createProjectRow(project, 'persisted')));
      pendingProjects.forEach((project) => projectList.append(createProjectRow(project, 'pending')));
    }

    function syncOptionGroup(group) {
      const radios = [...group.querySelectorAll('input[type="radio"]')];
      radios.forEach((radio) => {
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
      document.querySelectorAll('.option input, .remove-pending').forEach((control) => { control.disabled = busy; });
    }

    bindOptionGroup(document.getElementById('autoTrackGroup'));
    bindOptionGroup(document.getElementById('companionGroup'));

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
          saveButton.textContent = 'Retry save';
          setFeedback(result.error || 'Setup could not be saved.', 'error', 'error:retry-available');
          return;
        }

        saveButton.textContent = 'Setup complete';
        setFeedback('Setup complete. Opening KitCode companion...', 'success', 'setup:complete');
      } catch {
        setBusy(false);
        saveButton.textContent = 'Retry save';
        setFeedback('Setup request failed. Your selections are still here.', 'error', 'error:retry-available');
      }
    });

    if (!bridge) {
      setBusy(true);
      setFeedback('KitCode setup bridge is unavailable. Close this window and run kitcode setup again.', 'error', 'error:preload');
      return;
    }

    document.getElementById('closeButton').addEventListener('click', () => bridge.close());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !saving) bridge.close();
    });

    bridge.initialState().then((state) => {
      persistedProjects = Array.isArray(state.projects) ? state.projects : [];
      document.querySelector('input[name="autoTrack"][value="' + (state.autoTrack === false ? 'no' : 'yes') + '"]').checked = true;
      document.querySelector('input[name="companionView"][value="' + (state.companionView === 'pet' ? 'pet' : 'mini') + '"]').checked = true;
      document.querySelectorAll('.option-group').forEach(syncOptionGroup);
      renderProjects();
      setFeedback(
        persistedProjects.length ? persistedProjects.length + ' tracked project' + (persistedProjects.length === 1 ? '' : 's') + ' loaded.' : 'Add one or more projects to continue.',
        'normal',
        persistedProjects.length ? 'projects:loaded' : 'setup:ready'
      );
    }).catch(() => {
      renderProjects();
      setFeedback('Local setup state could not be loaded. Restart setup and try again.', 'error', 'error:initial-state');
    });
  </script>
</body>
</html>`;
}
