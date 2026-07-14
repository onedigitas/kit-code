import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {
  KITCODE_DISPLAY_MILESTONES,
  KITCODE_REWARD_TIERS,
  RUNNER_DISPLAY_PATH,
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

  assert(hookCommand.startsWith(RUNNER_DISPLAY_PATH), `${source}: hook command must use durable runner`);
  assert(!hookCommand.startsWith('kitcode '), `${source}: hook command must not require global kitcode`);
  assert(setupPrompt.includes(hookCommand), `${source}: setup prompt must include shared hook command`);
  assert(setupPrompt.includes(skillMarkdown), `${source}: setup prompt must include shared skill markdown`);
  assert(!skillMarkdown.includes('git show HEAD --format='), `${source}: skill must not duplicate count logic`);
  assert(!skillMarkdown.includes('equalsLedger.total_equals'), `${source}: skill must not instruct ledger mutation`);
  assert(skillMarkdown.includes(`${RUNNER_DISPLAY_PATH} terminal`), `${source}: skill must expose the runner terminal command`);
  assert(skillMarkdown.includes(`${RUNNER_DISPLAY_PATH} pet`), `${source}: skill must expose the runner pet command`);
  assert(skillMarkdown.includes('/kitcode summary'), `${source}: skill must describe /kitcode management shortcuts`);
  assert(skillMarkdown.includes(`${RUNNER_DISPLAY_PATH} awards`), `${source}: skill must expose CLI award checks`);
  assert(setupPrompt.includes(`${source} on`), `${source}: setup prompt must include installer command`);
  assert(setupPrompt.includes('UserPromptSubmit'), `${source}: setup prompt must describe the prompt submit hook`);
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
  webGateway.includes("assistantSetupPrompt('codex')") && webGateway.includes("assistantSetupPrompt('claude')"),
  'web gateway must provide one concise assistant-led setup path for Codex and Claude',
);
assert(
  webGateway.includes('Node.js 20+') && webGateway.includes('ask for my confirmation before installing or upgrading it'),
  'web gateway setup copy must require Node.js confirmation before installation',
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
