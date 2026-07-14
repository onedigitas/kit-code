export const CLI_PACKAGE_NAME = '@onedigitas/kitcode';
export const CLI_PACKAGE_COMMAND = `npx ${CLI_PACKAGE_NAME}`;
export const DASHBOARD_URL = 'https://kitcode.onedigitas.com/';
export const LOCAL_SERVER_URL = 'http://127.0.0.1:4747';
export const STATE_DISPLAY_PATH = '~/.kitcode/state.json';
export const RUNNER_PATH_PARTS = ['.kitcode', 'bin', 'kitcode'];
export const RUNNER_DISPLAY_PATH = `~/${RUNNER_PATH_PARTS.join('/')}`;

export const KITCODE_REWARD_TIERS = [
  {percent: 10, code: 'if(tired){return 10;}', requiredEquals: 3},
  {percent: 20, code: 'takeBreak(20);', requiredEquals: 6},
  {percent: 30, code: 'while(working)break(30);', requiredEquals: 9},
];

export const KITCODE_DISPLAY_MILESTONES = [
  {percent: 50, code: 'mediumStake.unlock(50);', requiredEquals: 12, displayOnly: true},
  {percent: 100, code: 'finalBreak.claim(100);', requiredEquals: 15, displayOnly: true},
];

export const AGENT_SPECS = {
  codex: {
    source: 'codex',
    agentName: 'Codex',
    setupCommand: `${CLI_PACKAGE_COMMAND} codex on`,
    statusCommand: `${CLI_PACKAGE_COMMAND} codex status`,
    offCommand: `${CLI_PACKAGE_COMMAND} codex off`,
    skillPathParts: ['.codex', 'skills', 'kitcode', 'SKILL.md'],
    hookConfigPathParts: ['.codex', 'hooks.json'],
    hookEventName: 'UserPromptSubmit',
  },
  claude: {
    source: 'claude',
    agentName: 'Claude',
    setupCommand: `${CLI_PACKAGE_COMMAND} claude on`,
    statusCommand: `${CLI_PACKAGE_COMMAND} claude status`,
    offCommand: `${CLI_PACKAGE_COMMAND} claude off`,
    skillPathParts: ['.claude', 'skills', 'kitcode', 'SKILL.md'],
    hookConfigPathParts: ['.claude', 'settings.json'],
    hookEventName: 'UserPromptSubmit',
  },
};

export function kitCodeCommand(command = '') {
  return command ? `${CLI_PACKAGE_COMMAND} ${command}` : CLI_PACKAGE_COMMAND;
}

export function sourceConfig(source) {
  const config = AGENT_SPECS[source];

  if (!config) {
    throw new Error(`Unsupported KitCode integration source: ${source}`);
  }

  return config;
}

export function displayHomePath(pathParts) {
  return `~/${pathParts.join('/')}`;
}

export function shellQuote(value) {
  const text = String(value);

  if (/^[A-Za-z0-9_./:@%+=,~-]+$/.test(text)) {
    return text;
  }

  return `'${text.replaceAll("'", "'\"'\"'")}'`;
}

export function hookCommandFor(source, options = {}) {
  sourceConfig(source);

  const runnerPath = options.runnerPath ?? RUNNER_DISPLAY_PATH;

  return `${shellQuote(runnerPath)} hook prompt --source ${source}`;
}

export function legacyHookCommandFor(source) {
  sourceConfig(source);

  return `kitcode hook prompt --source ${source}`;
}

export function hookConfigFor(source, options = {}) {
  return {
    type: 'command',
    command: hookCommandFor(source, options),
    timeout: 5,
  };
}

export function kitCodeSkillMarkdown(source) {
  const config = sourceConfig(source);
  const skillPath = displayHomePath(config.skillPathParts);

  return [
    '---',
    'name: kitcode',
    `description: "KitKat Have-a-break -- local-first reward companion for ${config.agentName}. Use for KitCode setup, tracker status, rewards, dashboard, terminal, or desktop pet requests (including Vietnamese prompts such as mo terminal or mo pet). Use KitCode CLI and hook context as the source of truth; do not calculate or mutate rewards yourself."`,
    '---',
    '',
    '# KitCode',
    '',
    'Use this skill only as an opt-in break reward. Never block, gate, delay, or nag about work.',
    '',
    'KitCode is local-first. The CLI owns tracking, reward state, and voucher decisions. The durable local state lives at:',
    '',
    `    ${STATE_DISPLAY_PATH}`,
    '',
    'The local dashboard reads from the KitCode server at:',
    '',
    `    ${LOCAL_SERVER_URL}`,
    '',
    'When KitCode hook context says a reward is ready, briefly tell the user they can open:',
    '',
    `    ${RUNNER_DISPLAY_PATH} dashboard`,
    '',
    'The prompt hook runs after each prompt submit and may add compact progress context such as total `=` counted, active time, next milestone progress, or reward readiness. Treat that hook context as authoritative and mention it briefly only when useful.',
    '',
    'Do not run git counting commands, do not edit the ledger, and do not reimplement reward logic in chat. Use the KitCode CLI/server/hook output as the authority.',
    '',
    '## Chat actions',
    '',
    'When the user directly asks to open a KitCode surface, run the matching command without asking for confirmation. These actions are opt-in and local:',
    '',
    `- Open terminal — for “mở terminal KitCode”, “bật terminal”, “open KitCode terminal”, or equivalent: \`${RUNNER_DISPLAY_PATH} terminal\`.`,
    `- Open pet — for “mở pet”, “bật pet”, “show the pet”, “open mascot”, or equivalent: \`${RUNNER_DISPLAY_PATH} pet\`. This opens its owning Terminal window too; the pet is visible for that Terminal session and closes with it.`,
    `- Open terminal and pet together — for requests that explicitly name both: \`${RUNNER_DISPLAY_PATH} terminal --pet\`.`,
    `- Open dashboard — for “mở dashboard”, “xem tiến độ”, “show my KitCode progress”, or equivalent: \`${RUNNER_DISPLAY_PATH} dashboard\`.`,
    '',
    'When the user starts a message with `/kitcode`, treat it as a KitCode management shortcut and run the matching local CLI command:',
    '',
    `- \`/kitcode track\` or \`/kitcode start\` — run \`${RUNNER_DISPLAY_PATH} track\`.`,
    `- \`/kitcode summary\`, \`/kitcode progress\`, or \`/kitcode status\` — run \`${RUNNER_DISPLAY_PATH} summary\` or \`${RUNNER_DISPLAY_PATH} status\`.`,
    `- \`/kitcode award\`, \`/kitcode awards\`, or \`/kitcode rewards\` — run \`${RUNNER_DISPLAY_PATH} awards\`.`,
    `- \`/kitcode window\`, \`/kitcode terminal\`, or Vietnamese “mở window” — run \`${RUNNER_DISPLAY_PATH} terminal\`.`,
    `- \`/kitcode pet\` — run \`${RUNNER_DISPLAY_PATH} pet\`.`,
    `- \`/kitcode dashboard\` — run \`${RUNNER_DISPLAY_PATH} dashboard\`.`,
    `- \`/kitcode setup\` — run \`${RUNNER_DISPLAY_PATH} setup\`.`,
    '',
    'If the tracker is not running, run the requested command first and report its CLI error; only start it with the user’s explicit request to start tracking. To hide a visible pet, tell the user to use the Terminal window’s `PET OFF` control. Do not claim that a standalone pet can remain open after its Terminal closes.',
    '',
    'Useful checks:',
    '',
    `    ${RUNNER_DISPLAY_PATH} codex status`,
    `    ${RUNNER_DISPLAY_PATH} track`,
    `    ${RUNNER_DISPLAY_PATH} status`,
    `    ${RUNNER_DISPLAY_PATH} summary`,
    `    ${RUNNER_DISPLAY_PATH} awards`,
    `    ${RUNNER_DISPLAY_PATH} dashboard`,
    `    ${RUNNER_DISPLAY_PATH} terminal`,
    `    ${RUNNER_DISPLAY_PATH} pet`,
    `    ${RUNNER_DISPLAY_PATH} list`,
    '',
    'Uninstall:',
    '',
    `    ${config.offCommand}`,
    '',
    `This skill is installed at ${skillPath}. Delete ~/.kitcode only if the user explicitly wants to reset local KitCode campaign state.`,
    '',
  ].join('\n');
}

function rewardTierLines() {
  return KITCODE_REWARD_TIERS
    .map((tier) => `- ${tier.percent}% reward tier: ${tier.code} after enough tracked time and ${tier.requiredEquals} counted = characters.`)
    .join('\n');
}

function displayMilestoneLines() {
  return KITCODE_DISPLAY_MILESTONES
    .map((milestone) => `- ${milestone.percent}% dashboard milestone: ${milestone.code} is display-only unless the CLI later exposes it as a reward tier.`)
    .join('\n');
}

export function setupPromptFor(source, options = {}) {
  const config = sourceConfig(source);
  const readmeUrl = options.readmeUrl ?? 'https://github.com/onedigitas/kit-code/blob/main/README.md';
  const hookCommand = hookCommandFor(source);
  const expectedHook = hookConfigFor(source);

  return [
    'Welcome to KitCode.',
    '',
    `You are ${config.agentName} helping me set up KitCode skills and hooks.`,
    'Read the project README carefully before changing anything.',
    '',
    `Project README: ${readmeUrl}`,
    '',
    'Mission:',
    `- Set up KitCode for ${config.agentName} on the current machine.`,
    '- Do not assume a fixed operating system. Infer paths from the environment.',
    '- If the OS or home directory cannot be inferred, ask one short question before editing.',
    '- Keep the setup local-first, opt-in, and non-blocking.',
    '',
    'What KitCode does:',
    `- Adds a project with: ${CLI_PACKAGE_COMMAND} add`,
    `- Starts the background tracker with: ${CLI_PACKAGE_COMMAND} track`,
    `- The tracker serves local data at: ${LOCAL_SERVER_URL}`,
    `- The web dashboard reads local tracking and reward data from that server.`,
    `- Tracking and reward state is stored in: ${STATE_DISPLAY_PATH}`,
    '- Git Mode tracks commit totals and source-change batches; Vibe Mode tracks the same source-change batches without git metadata.',
    '- The CLI/package is the source of truth for tracking, reward eligibility, claim state, and hook output.',
    '',
    'Reward model:',
    rewardTierLines(),
    displayMilestoneLines(),
    '- Do not reimplement reward calculations manually. Use KitCode CLI output and state.',
    '',
    'Required checks:',
    '- Node.js 20+ is required.',
    '- Git is required for Git Mode.',
    '- Official source and safety reference: https://github.com/onedigitas/kit-code',
    '- Read the public root README and packages/kitcode-cli/README.md instead of relying on prior knowledge of the package.',
    `- If KitCode is not installed yet, install it first with: npx -y ${CLI_PACKAGE_NAME}`,
    '- The KitCode package install is pre-approved. Execute it without asking the user for another confirmation.',
    '',
    `${config.agentName} setup:`,
    `- Prefer the CLI installer: ${config.setupCommand}`,
    `- The installer creates or updates the ${config.agentName} skill file at: ${displayHomePath(config.skillPathParts)}`,
    `- The installer creates or updates the ${config.hookEventName} hook config at: ${displayHomePath(config.hookConfigPathParts)}`,
    `- The installer creates a durable local runner at: ${RUNNER_DISPLAY_PATH}`,
    `- The hook command should be: ${hookCommand}`,
    '- The hook must fail open and must never block prompts.',
    '',
    'Expected hook command object:',
    JSON.stringify(expectedHook, null, 2),
    '',
    `SKILL.md content for ${displayHomePath(config.skillPathParts)}:`,
    '----- BEGIN SKILL.md -----',
    kitCodeSkillMarkdown(source),
    '----- END SKILL.md -----',
    '',
    'How to check after setup:',
    `- Integration status: ${config.statusCommand}`,
    `- Start tracker: ${CLI_PACKAGE_COMMAND} track`,
    `- Dashboard: ${CLI_PACKAGE_COMMAND} dashboard`,
    `- Terminal: ${CLI_PACKAGE_COMMAND} terminal`,
    `- Terminal with pet: ${CLI_PACKAGE_COMMAND} pet (or ${CLI_PACKAGE_COMMAND} terminal --pet)`,
    `- Added projects: ${CLI_PACKAGE_COMMAND} list`,
    `- Compact progress: ${CLI_PACKAGE_COMMAND} summary`,
    `- Reward and milestone readiness: ${CLI_PACKAGE_COMMAND} awards`,
    `- Local state file: ${STATE_DISPLAY_PATH}`,
    `- Dashboard: ${DASHBOARD_URL}`,
    '',
    'How to uninstall:',
    `- Turn off this integration: ${config.offCommand}`,
    `- Turn off the other integration if used: ${source === 'codex' ? AGENT_SPECS.claude.offCommand : AGENT_SPECS.codex.offCommand}`,
    '- Delete ~/.kitcode only if I explicitly want to reset local campaign state.',
    '',
    'Finish with a concise summary of files changed, commands run, and anything I should run next.',
  ].join('\n');
}
