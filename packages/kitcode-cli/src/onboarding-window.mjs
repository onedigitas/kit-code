export function renderOnboardingWindow() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KitCode Setup</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #050705;
      --panel: #0b0f0c;
      --line: #2f1515;
      --line-strong: #6f2020;
      --primary: #fc0a0a;
      --primary-strong: #ff6b6b;
      --text: #f4ffee;
      --muted: #a6b6a2;
      --dim: #657360;
      --error: #ff9d9d;
      background: var(--bg);
      color: var(--text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
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
      font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      -webkit-font-smoothing: antialiased;
    }

    button,
    input { font: inherit; }

    .shell {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: 35px minmax(0, 1fr) 29px;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      background:
        linear-gradient(180deg, rgba(252, 10, 10, 0.08), transparent 34%),
        var(--panel);
    }

    .chrome,
    .statusline {
      display: flex;
      align-items: center;
      min-width: 0;
      background: #090707;
      color: var(--muted);
      font-size: 11px;
      white-space: nowrap;
    }

    .chrome {
      border-bottom: 1px solid var(--line);
      -webkit-app-region: drag;
    }

    .tab {
      align-self: stretch;
      display: inline-flex;
      align-items: center;
      padding: 0 14px;
      border-right: 1px solid var(--line);
      background: #1a0808;
      color: var(--primary-strong);
      font-weight: 900;
    }

    .safe-label { margin-left: auto; }

    .close-button {
      width: 34px;
      height: 33px;
      margin-left: 8px;
      border: 0;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      -webkit-app-region: no-drag;
    }

    .close-button:hover,
    .close-button:focus-visible {
      outline: 1px solid var(--primary);
      outline-offset: -4px;
      color: var(--text);
    }

    .content {
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr) auto auto;
      gap: 10px;
      padding: 15px 20px 13px;
    }

    .intro { min-width: 0; }

    .eyebrow,
    .step-title,
    .project-count,
    .project-meta,
    .hint {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .eyebrow,
    .step-title,
    .project-count { color: var(--primary-strong); }

    h1 {
      margin: 1px 0 2px;
      color: var(--text);
      font-size: 26px;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .lead,
    .hint { margin: 0; color: var(--muted); }

    .step {
      min-width: 0;
      margin: 0;
      padding: 9px 0 0;
      border: 0;
      border-top: 1px solid var(--line);
    }

    .step-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 7px;
    }

    .project-count { margin-left: auto; }

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
      border: 1px solid var(--line);
      background: #0b0909;
      color: var(--muted);
      cursor: pointer;
      user-select: none;
    }

    .option input:checked + .option-card {
      border-color: var(--primary);
      background: rgba(252, 10, 10, 0.12);
      color: var(--text);
    }

    .option input:focus-visible + .option-card {
      outline: 2px solid var(--primary-strong);
      outline-offset: 2px;
    }

    .option-mark {
      flex: 0 0 auto;
      color: var(--primary-strong);
      font-weight: 900;
    }

    .option-copy { font-weight: 900; }

    .projects-step {
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(72px, 1fr) auto;
    }

    .project-list {
      min-height: 72px;
      overflow: auto;
      border: 1px solid var(--line);
      background: rgba(5, 7, 5, 0.56);
      scrollbar-color: var(--line-strong) var(--bg);
    }

    .empty-state {
      min-height: 70px;
      display: grid;
      place-items: center;
      padding: 12px;
      color: var(--dim);
      font-size: 11px;
      text-align: center;
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

    .project-name { color: var(--text); font-weight: 900; }
    .project-path { color: var(--dim); font-size: 10px; }
    .project-meta { color: var(--muted); }
    .project-row[data-kind="pending"] .project-meta { color: var(--primary-strong); }

    .remove-pending,
    .terminal-button {
      border: 1px solid var(--line-strong);
      background: #180909;
      color: var(--text);
      cursor: pointer;
      font-weight: 900;
      -webkit-app-region: no-drag;
    }

    .remove-pending {
      width: 25px;
      height: 25px;
      padding: 0;
      color: var(--muted);
    }

    .remove-pending:hover,
    .remove-pending:focus-visible,
    .terminal-button:hover,
    .terminal-button:focus-visible {
      border-color: var(--primary);
      outline: 1px solid var(--primary-strong);
      outline-offset: 2px;
      color: var(--text);
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
    }

    .terminal-button {
      min-height: 34px;
      padding: 7px 11px;
    }

    .primary-button {
      min-width: 194px;
      border-color: var(--primary);
      background: var(--primary);
      color: #100606;
      white-space: nowrap;
    }

    .primary-button:hover,
    .primary-button:focus-visible { color: #100606; }

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
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message[data-state="error"] { color: var(--error); }
    .message[data-state="success"] { color: var(--primary-strong); }

    .statusline {
      border-top: 1px solid var(--line);
      background: #170b0b;
      color: var(--text);
    }

    .normal-mode {
      align-self: stretch;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      background: var(--primary);
      color: #100606;
      font-weight: 900;
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
<body>
  <main class="shell" data-testid="setup-shell">
    <header class="chrome" title="Drag window">
      <span class="tab">kitcode-setup</span>
      <span class="safe-label">local-first setup</span>
      <button class="close-button" id="closeButton" type="button" aria-label="Close setup" title="Close">x</button>
    </header>

    <section class="content">
      <header class="intro">
        <span class="eyebrow">Hello, KitCoder.</span>
        <h1>KITCODE SETUP</h1>
        <p class="lead">Configure one local tracker for all of your coding projects.</p>
      </header>

      <fieldset class="step" id="trackingStep">
        <legend class="step-title">01 / START TRACKING AFTER SETUP</legend>
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

      <section class="step projects-step" aria-labelledby="projectsTitle">
        <div class="step-head">
          <span class="step-title" id="projectsTitle">02 / PROJECTS</span>
          <span class="project-count" id="projectCount">0 ADDED</span>
        </div>
        <div class="project-list" id="projectList" role="list" aria-label="KitCode projects" data-testid="project-list"></div>
        <div class="project-actions">
          <button class="terminal-button" id="pickFolders" type="button" data-testid="add-projects">+ ADD PROJECTS</button>
          <p class="hint">Existing files become the baseline. Source and diffs stay local.</p>
        </div>
      </section>

      <fieldset class="step">
        <legend class="step-title">03 / COMPANION VIEW</legend>
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

      <div class="actions">
        <div class="message" id="message" aria-live="polite">Ready to configure KitCode.</div>
        <button class="terminal-button primary-button" id="saveButton" type="button" data-testid="save-setup">SAVE &amp; OPEN KITCODE</button>
      </div>
    </section>

    <footer class="statusline">
      <span class="normal-mode">NORMAL</span>
      <span class="status-text" id="statusText">setup:ready</span>
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
      meta.textContent = (project.sourceType || 'vibe').toUpperCase() + ' · ' + (kind === 'pending' ? 'PENDING' : 'TRACKED');
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
      projectCount.textContent = projects.length + ' ADDED';

      if (!projects.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'NO PROJECTS ADDED · SELECT ONE OR MORE LOCAL FOLDERS';
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
      saveButton.textContent = 'SAVING...';
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
          saveButton.textContent = 'RETRY SAVE';
          setFeedback(result.error || 'Setup could not be saved.', 'error', 'error:retry-available');
          return;
        }

        saveButton.textContent = 'SETUP COMPLETE';
        setFeedback('Setup complete. Opening KitCode companion...', 'success', 'setup:complete');
      } catch {
        setBusy(false);
        saveButton.textContent = 'RETRY SAVE';
        setFeedback('Setup request failed. Your selections are still here.', 'error', 'error:retry-available');
      }
    });

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
