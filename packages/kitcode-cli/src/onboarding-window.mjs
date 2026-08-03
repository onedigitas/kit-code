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
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap');

    :root {
      color-scheme: dark;
      --bg-color: #111113;
      --red-color: #e51324;
      --grey-border: #555558;
      --grey-text: #88888e;
      --white-text: #e1e1e6;
      --error: #ff9d9d;
      --font-mono: 'Fira Code', 'Courier New', Courier, ui-monospace, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      color: var(--white-text);
      font: 11px/1.4 var(--font-mono);
      -webkit-font-smoothing: antialiased;
    }

    button, input { font: inherit; }
    button, .option { cursor: pointer; }
    button:disabled { cursor: not-allowed; }

    .tech-box-red {
      border-top: 3px solid var(--red-color);
      border-bottom: 3px solid var(--red-color);
      border-left: 2px dashed var(--red-color);
      border-right: 2px dashed var(--red-color);
    }

    .tech-box-grey {
      border-top: 3px solid var(--grey-border);
      border-bottom: 3px solid var(--grey-border);
      border-left: 2px dashed var(--grey-border);
      border-right: 2px dashed var(--grey-border);
    }

    .tech-box-white {
      border-top: 3px solid var(--white-text);
      border-bottom: 3px solid var(--white-text);
      border-left: 2px dashed var(--white-text);
      border-right: 2px dashed var(--white-text);
    }

    .dashed-divider, .section-divider {
      color: var(--red-color);
      font-size: 11px;
      letter-spacing: 1px;
      overflow: hidden;
      white-space: nowrap;
      margin: 14px 0;
      width: 100%;
      user-select: none;
      opacity: 0.85;
      line-height: 1;
    }

    .shell.window {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-color);
      border: 1px solid var(--red-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .title-bar {
      height: 38px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--red-color);
      -webkit-app-region: drag;
    }

    .dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      border: 1px solid var(--red-color);
      padding: 0;
      background: transparent;
    }

    .dot.filled { background-color: var(--red-color); }

    .dot.dot-close {
      position: relative;
      z-index: 1;
      box-sizing: content-box;
      border: 0;
      padding: 7px;
      margin: -7px;
      display: grid;
      place-items: center;
      background-clip: content-box;
      color: var(--bg-color);
      font: 700 10px/1 var(--font-mono);
      cursor: pointer;
      -webkit-app-region: no-drag;
    }

    .dot.dot-close::before {
      content: "×";
      opacity: 0;
    }

    .dot.dot-close:hover::before,
    .dot.dot-close:focus-visible::before { opacity: 1; }

    .dot.dot-close:focus-visible { outline: none; }

    .container {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 16px 28px 20px;
    }

    .top-tag {
      text-align: right;
      color: var(--white-text);
      font-size: 11px;
      margin-bottom: 4px;
    }

    .workspace.layout {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      gap: 60px;
      padding: 24px 0 30px;
      overflow: auto;
    }

    .steps-panel { min-height: 0; }

    .sidebar {
      width: 150px;
      flex: 0 0 150px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .rail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--grey-text);
    }

    .rail-item.is-active { color: var(--red-color); }

    .rail-item:not(.is-active) .rail-badge {
      border-color: var(--grey-border);
    }

    .rail-badge {
      padding: 3px 6px;
      font-weight: 700;
      font-size: 11px;
    }

    .rail-label {
      font-size: 10px;
      line-height: 1.3;
      font-weight: 700;
    }

    .step-connector {
      width: 1px;
      height: 32px;
      border-left: 2px dashed var(--red-color);
      margin: 6px 0 6px 13px;
    }

    .content {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section-title {
      font-size: 11px;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
      color: var(--white-text);
      font-weight: 500;
      text-transform: uppercase;
    }

    .step { border: 0; margin: 0; padding: 0; min-width: 0; }

    .option-group {
      display: flex;
      gap: 15px;
    }

    .option {
      position: relative;
      width: 72px;
      height: 38px;
      flex: 0 0 72px;
    }

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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 38px;
      background: transparent;
      padding: 0;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      cursor: pointer;
      user-select: none;
      color: var(--grey-text);
    }

    .option-card.btn-red { color: var(--red-color); }
    .option-card.btn-grey { color: var(--grey-text); }

    .option input + .option-card {
      color: var(--grey-text);
      border-top-color: var(--grey-border);
      border-bottom-color: var(--grey-border);
      border-left-color: var(--grey-border);
      border-right-color: var(--grey-border);
    }

    .option input:checked + .option-card {
      color: var(--red-color);
      border-top-color: var(--red-color);
      border-bottom-color: var(--red-color);
      border-left-color: var(--red-color);
      border-right-color: var(--red-color);
    }

    .option input:focus-visible + .option-card {
      outline: none;
      box-shadow: inset 0 0 0 1px var(--red-color);
    }

    .step-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .step-head .section-title { margin-bottom: 0; }

    .project-count {
      margin-left: auto;
      color: var(--red-color);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      display: none;
    }

    .projects-step {
      display: flex;
      flex-direction: column;
      min-height: 0;
      flex: 1 1 auto;
    }

    .project-list {
      min-height: 120px;
      max-height: 180px;
      overflow: auto;
      margin-bottom: 16px;
      scrollbar-color: var(--red-color) var(--bg-color);
    }

    .project-list.is-empty {
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--grey-text);
      overflow: hidden;
      scrollbar-width: none;
    }

    .project-list.is-empty::-webkit-scrollbar { display: none; }

    .dropzone-icon {
      width: 22px;
      height: 18px;
      stroke: var(--grey-text);
      fill: none;
      stroke-width: 1.5;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }

    .project-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 9px;
      min-height: 38px;
      padding: 5px 8px;
      border-bottom: 1px dashed rgba(240, 48, 48, 0.25);
    }

    .project-row:last-child { border-bottom: 0; }
    .project-row[data-kind="pending"] { background: rgba(240, 48, 48, 0.06); }

    .project-copy { min-width: 0; }

    .project-name,
    .project-path {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .project-name { color: var(--white-text); font-weight: 700; }
    .project-path { color: var(--grey-text); font-size: 10px; }
    .project-meta { color: var(--grey-text); font-size: 9px; font-weight: 700; }
    .project-row[data-kind="pending"] .project-meta { color: var(--red-color); }

    .project-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .hint {
      color: var(--white-text);
      font-size: 10px;
      line-height: 1.4;
      text-transform: uppercase;
    }

    .terminal-button {
      background: transparent;
      color: var(--red-color);
      padding: 8px 18px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      cursor: pointer;
      -webkit-app-region: no-drag;
    }

    .terminal-button:hover,
    .terminal-button:focus-visible,
    .remove-project:hover,
    .remove-project:focus-visible {
      background: rgba(240, 48, 48, 0.12);
      outline: none;
    }

  .remove-project {
      width: 25px;
      height: 25px;
      border: 1px dashed var(--grey-border);
      background: transparent;
      color: var(--grey-text);
      cursor: pointer;
    }

    .content-footer.footer-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin: 12px 0;
    }

    .message.comment-text {
      min-width: 0;
      color: var(--white-text);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message[data-state="error"] { color: var(--error); }
    .message[data-state="success"] { color: var(--red-color); }

    .primary-button { white-space: nowrap; }

    button:disabled { cursor: not-allowed; opacity: 0.48; }

    .statusline.status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: var(--white-text);
      margin-top: 4px;
    }

    .normal-mode.status-mode {
      padding: 2px 6px;
      font-weight: 700;
      color: var(--red-color);
    }

    .status-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-text[data-state="error"] { color: var(--error); }
    .status-text[data-state="success"] { color: var(--red-color); }

    .keyboard-hint.status-shortcuts { color: var(--white-text); }
  </style>
</head>
<body data-platform="${theme.id}" data-theme-marker="${theme.marker}">
  <main class="shell window" data-testid="setup-shell">
    ${renderPlatformChrome(theme)}
    <div class="container">
      <div class="top-tag">local-first setup</div>
      <div class="dashed-divider section-divider" aria-hidden="true">==================================================================================================================================================================================================</div>
      <div class="workspace layout steps-panel" id="setupContent" data-testid="setup-step-rail">
        <aside class="sidebar">
          <div class="rail-item is-active" data-step="tracking" data-testid="setup-rail-tracking">
            <span class="rail-badge tech-box-red">01</span>
            <span class="rail-label">START TRACKING<br>AFTER SETUP</span>
          </div>
          <div class="step-connector" aria-hidden="true"></div>
          <div class="rail-item" data-step="projects" data-testid="setup-rail-projects">
            <span class="rail-badge tech-box-red">02</span>
            <span class="rail-label">PROJECTS</span>
          </div>
        </aside>
        <div class="content">
          <fieldset class="step" id="trackingStep" data-setup-step="tracking">
            <legend class="section-title">Start tracking after setup?</legend>
            <div class="option-group" id="autoTrackGroup" role="radiogroup" aria-label="Start tracking after setup" data-next-focus="pickFolders">
              <label class="option">
                <input type="radio" name="autoTrack" value="yes" checked data-testid="auto-track-yes">
                <span class="option-card btn btn-red tech-box-red option-mark">[ YES ]</span>
              </label>
              <label class="option">
                <input type="radio" name="autoTrack" value="no" data-testid="auto-track-no">
                <span class="option-card btn btn-grey tech-box-grey option-mark">[ NO ]</span>
              </label>
            </div>
          </fieldset>
          <section class="step projects-step" aria-labelledby="projectsTitle" data-setup-step="projects">
            <div class="step-head">
              <h2 class="section-title" id="projectsTitle">Select one or more local folders</h2>
              <span class="project-count" id="projectCount">0 ADDED</span>
            </div>
            <div class="project-list is-empty tech-box-white" id="projectList" role="list" aria-label="KitCode projects" data-testid="project-list"></div>
            <div class="project-actions">
              <button class="terminal-button tech-box-red" id="pickFolders" type="button" data-testid="add-projects">+ ADD PROJECTS</button>
              <p class="hint">Existing files become the baseline.<br>Source and diffs stay local.</p>
            </div>
          </section>
        </div>
      </div>
      <div class="dashed-divider section-divider" aria-hidden="true">==================================================================================================================================================================================================</div>
      <footer class="content-footer footer-action">
        <div class="message comment-text" id="message" aria-live="polite">/* Add one or more projects to continue.</div>
        <button class="terminal-button primary-button tech-box-red" id="saveButton" type="button" data-testid="save-setup">+ SAVE AND OPEN KITCODE -&gt;</button>
      </footer>
      <div class="dashed-divider section-divider" aria-hidden="true">==================================================================================================================================================================================================</div>
      <footer class="statusline status-bar">
        <span class="normal-mode status-mode tech-box-red">NORMAL</span>
        <span class="status-text" id="statusText" aria-live="polite">+++ setup: ready +++</span>
        <span class="keyboard-hint status-shortcuts">&#8593;&#8595; move # space select # enter continue</span>
      </footer>
    </div>
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
    const SAVE_LABEL = '+ SAVE AND OPEN KITCODE ->';
    const FOLDER_ICON = '<svg class="dropzone-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
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

    function formatStatus(status) {
      const value = status || 'setup:ready';
      return value.startsWith('+++') ? value : '+++ ' + value + ' +++';
    }

    function setFeedback(text, state, status) {
      message.textContent = text.startsWith('/*') ? text : '/* ' + text;
      message.dataset.state = state || 'normal';
      statusText.textContent = formatStatus(status);
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
      projectList.classList.toggle('tech-box-white', !projects.length);

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
        if (document.activeElement !== radio) radio.tabIndex = radio.checked ? 0 : -1;
        radio.setAttribute('aria-checked', String(radio.checked));
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
          statusText.textContent = formatStatus('select:space-or-enter');
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
      const companionView = 'mini';

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

    function closeSetup() {
      try {
        const result = bridge?.close();
        if (result && typeof result.catch === 'function') result.catch(() => window.close());
        if (!result) window.close();
      } catch {
        window.close();
      }
    }

    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('pointerdown', (event) => event.stopPropagation());
    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      closeSetup();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !saving) closeSetup();
    });

    if (!bridge) {
      setBusy(true);
      setFeedback('KitCode setup bridge is unavailable. Close this window and run kitcode setup again.', 'error', 'error:preload');
    } else {
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