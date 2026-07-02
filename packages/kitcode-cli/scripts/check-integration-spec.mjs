import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
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
}

assert(
  KITCODE_REWARD_TIERS.map((tier) => tier.percent).join(',') === '10,20,30',
  'reward tiers must remain the CLI-backed 10,20,30 source',
);
assert(
  KITCODE_DISPLAY_MILESTONES.map((milestone) => milestone.percent).join(',') === '50,100',
  'display-only milestones must remain 50,100',
);

const webGateway = fs.readFileSync(
  path.resolve(process.cwd(), '../../apps/web/src/components/project-gateway.tsx'),
  'utf8',
);

assert(
  webGateway.includes("setupPromptFor('codex'") && webGateway.includes("setupPromptFor('claude'"),
  'web gateway must generate newbie prompts from shared integration spec',
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
