import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {
  KITCODE_DISPLAY_MILESTONES,
  KITCODE_REWARD_TIERS,
  CLI_PACKAGE_COMMAND,
  RUNNER_DISPLAY_PATH,
  assistantSetupPromptFor,
  hookCommandFor,
  kitCodeSkillMarkdown,
  setupPromptFor,
} from '../src/integration-spec.mjs';

const failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

for (const source of ['codex', 'claude']) {
  const hookCommand = hookCommandFor(source);
  const skillMarkdown = kitCodeSkillMarkdown(source);
  const setupPrompt = setupPromptFor(source);
  const assistantPrompt = assistantSetupPromptFor(source);

  assert(hookCommand.startsWith(RUNNER_DISPLAY_PATH), `${source}: hook command must use durable runner`);
  assert(!hookCommand.startsWith('kitcode '), `${source}: hook command must not require global kitcode`);
  assert(setupPrompt.includes(hookCommand), `${source}: setup prompt must include shared hook command`);
  assert(setupPrompt.includes(skillMarkdown), `${source}: setup prompt must include shared skill markdown`);
  assert(setupPrompt.includes('Welcome window'), `${source}: setup prompt must defer project setup to Welcome`);
  assert(setupPrompt.includes('do NOT run'), `${source}: setup prompt must forbid add/track during initial setup`);
  assert(assistantPrompt.includes(`${source} on`), `${source}: assistant prompt must include enable command`);
  assert(assistantPrompt.includes('Do NOT run'), `${source}: assistant prompt must forbid add/track during paste setup`);
  assert(assistantPrompt.includes('Welcome window'), `${source}: assistant prompt must require Welcome completion`);
  assert(assistantPrompt.includes('Never open Welcome twice'), `${source}: assistant prompt must forbid duplicate Welcome launches`);
  assert(assistantPrompt.includes('Opening KitCode Welcome'), `${source}: assistant prompt must treat codex on output as Welcome launch signal`);
  assert(!skillMarkdown.includes('git show HEAD --format='), `${source}: skill must not duplicate count logic`);
  assert(!skillMarkdown.includes('equalsLedger.total_equals'), `${source}: skill must not instruct ledger mutation`);
  assert(skillMarkdown.includes(`${RUNNER_DISPLAY_PATH} terminal`), `${source}: skill must expose the runner terminal command`);
  assert(skillMarkdown.includes(`${RUNNER_DISPLAY_PATH} pet`), `${source}: skill must expose the runner pet command`);
  assert(skillMarkdown.includes('/kitcode summary'), `${source}: skill must describe /kitcode management shortcuts`);
  assert(skillMarkdown.includes(`${RUNNER_DISPLAY_PATH} awards`), `${source}: skill must expose CLI award checks`);
  assert(skillMarkdown.includes(`${CLI_PACKAGE_COMMAND} uninstall`), `${source}: skill must expose full uninstall command`);
  assert(setupPrompt.includes(`${source} on`), `${source}: setup prompt must include installer command`);
  assert(setupPrompt.includes('UserPromptSubmit'), `${source}: setup prompt must describe the prompt submit hook`);
  assert(setupPrompt.includes(`${CLI_PACKAGE_COMMAND} uninstall`), `${source}: setup prompt must describe full uninstall`);
}

assert(
  KITCODE_REWARD_TIERS.map((tier) => tier.percent).join(',') === '10,20,30',
  'reward tiers must remain the CLI-backed 10,20,30 source',
);
assert(
  KITCODE_DISPLAY_MILESTONES.map((milestone) => milestone.percent).join(',') === '50,100',
  'display-only milestones must remain 50,100',
);

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webGateway = fs.readFileSync(
  path.join(packageRoot, '../../apps/web/src/components/project-gateway.tsx'),
  'utf8',
);

assert(
  webGateway.includes("assistantSetupPromptFor('codex')") && webGateway.includes("assistantSetupPromptFor('claude')"),
  'web gateway must provide one concise assistant-led setup path for Codex and Claude',
);
assert(
  webGateway.includes('projects are chosen later in KitCode Welcome'),
  'web gateway must explain that project selection happens in Welcome',
);
assert(
  assistantSetupPromptFor('codex').includes('Node.js 20+') &&
  assistantSetupPromptFor('codex').includes('ask for my confirmation before installing or upgrading it'),
  'shared assistant setup prompt must require Node.js confirmation before installation',
);
assert(
  !webGateway.includes('function kitCodeSkillMd'),
  'web gateway must not duplicate skill markdown',
);
assert(
  !webGateway.includes('"kitcode hook prompt --source'),
  'web gateway must not hardcode legacy hook command JSON',
);

if (failures.length > 0) {
  console.error('Integration spec checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Integration spec checks passed.');
