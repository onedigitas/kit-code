import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SKILL_CONFIGS = {
  codex: {
    agentName: 'Codex',
    path: path.join(os.homedir(), '.codex', 'skills', 'kitcode', 'SKILL.md'),
  },
  claude: {
    agentName: 'Claude',
    path: path.join(os.homedir(), '.claude', 'skills', 'kitcode', 'SKILL.md'),
  },
};

function sourceConfig(source) {
  const config = SKILL_CONFIGS[source];

  if (!config) {
    throw new Error(`Unsupported skill source: ${source}`);
  }

  return config;
}

function displayPath(filePath) {
  const home = os.homedir();

  return filePath.startsWith(home)
    ? `~${filePath.slice(home.length)}`
    : filePath;
}

function writeFileAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});

  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.kitcode.bak`;

    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }
  }

  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, value);
  fs.renameSync(tmpPath, filePath);
}

export function kitCodeSkillMarkdown(source) {
  const config = sourceConfig(source);
  const agentName = config.agentName;
  const skillPath = displayPath(config.path);

  return [
    '---',
    'name: kitcode',
    `description: "KitKat Have-a-break -- after a commit, or when I ask what is my break, count the real = I shipped and give me a code once I have earned it. Opt-in; tracks one developer-wide campaign across chats and projects for ${agentName}."`,
    '---',
    '',
    '# KitCode',
    '',
    'Use this skill only as an opt-in break reward. Never block, gate, delay, or nag about work. A chat becomes KitCode-active after the user invokes KitCode or explicitly asks "what is my break?" in that chat. In KitCode-active chats, append the status footer described below after every assistant response.',
    '',
    'Campaign ends on 2027-09-30. After that date, stay quiet and do not surface KitCode reward lines or KitCode status footers.',
    '',
    '## Count',
    '',
    'Count newly added lines of real code in the latest commit by running exactly:',
    '',
    "    git show HEAD --format= --unified=0 | grep '^+' | grep -v '^+++' | sed 's/^.//' | awk '{w=gsub(/[A-Za-z0-9_]/,\"&\"); if(w>=4 && w>length($0)*0.4) print}' | grep -oE '=' | wc -l",
    '',
    'Before counting, resolve the current commit and project:',
    '',
    '    git rev-parse HEAD',
    '    git rev-parse --show-toplevel',
    '',
    'If the current directory is not in a Git repository, do not mutate the ledger. Report the current global total if the ledger exists.',
    '',
    '## Ledger',
    '',
    'Keep one durable developer-wide campaign ledger across all chats and all projects inside the local KitCode state at:',
    '',
    '    ~/.kitcode/state.json',
    '',
    'Create ~/.kitcode and state.json on the first eligible counted commit. Treat a missing ledger as an empty campaign with 0 = shipped and no reward timer.',
    '',
    'The ledger schema is:',
    '',
    '    {',
    '      "version": 4,',
    '      "projects": {},',
    '      "equalsLedger": {',
    '        "total_equals": 0,',
    '        "counted_commits": {},',
    '        "counted_batches": {},',
    '        "earned_tiers": [],',
    '        "first_counted_at": null,',
    '        "last_updated_at": null',
    '      }',
    '    }',
    '',
    'Add each eligible latest-commit count once globally per commit hash under equalsLedger. Do not double-count the same commit hash, even if it appears in another chat or is checked from another project path. Do not store repo paths in equalsLedger; active folders belong only in the top-level projects object.',
    '',
    'When counting a new commit:',
    '- add the count to equalsLedger.total_equals;',
    '- add an entry to equalsLedger.counted_commits[commit_hash];',
    '- set equalsLedger.first_counted_at if it is missing;',
    '- update equalsLedger.last_updated_at.',
    '',
    '## Status Footer',
    '',
    'In KitCode-active chats, append exactly one compact status footer after every assistant response, unless the campaign has ended.',
    '',
    'Use:',
    '',
    '    KitCode: global 847 = - reward unlocks in 18m',
    '',
    'If first_counted_at does not exist yet, replace the timer phrase with:',
    '',
    '    reward timer starts after first counted commit',
    '',
    'Rewards unlock after 1 hour from first_counted_at in the global ledger. Before the unlock time, show the remaining duration rounded up to the nearest minute. After unlock, show reward unlocked.',
    '',
    '## Tiers',
    '',
    'Longer sessions earn bigger breaks:',
    '',
    '- 10%: if(tired){return 10;}',
    '- 30%: while(working)break(30);',
    '- free: exit(0)',
    '',
    'Surface exactly one reward line when a new tier is crossed and rewards are unlocked. Format it like:',
    '',
    '    847 = shipped -- your hands have not left the keyboard. Have a break. if(tired){return 10;} -> KitKat on GrabFood.',
    '',
    'Use the current global equalsLedger.total_equals, the earned tier code, and one concise KitKat break line. Record the surfaced tier in equalsLedger.earned_tiers. Never print multiple reward lines for the same tier.',
    '',
    '## Questions',
    '',
    'If the user asks how it works, explain transparently:',
    '',
    `- KitCode is a visible ${agentName} skill at ${skillPath}.`,
    '- It counts = characters from real-looking newly added lines in the latest commit using the exact command above.',
    '- It stores one developer-wide campaign ledger under equalsLedger in ~/.kitcode/state.json, shared across chats and projects.',
    '- It counts each commit hash once globally and tracks the global shipped = total without storing repo paths in the ledger.',
    '- It starts rewarding after 1 hour from the first counted commit in the global ledger.',
    `- It only acts in ${agentName} chats where KitCode has been invoked, and its after-every-response footer is best-effort agent behavior, not a background hook.`,
    '- It does not install git hooks, run hidden background work, or block any task.',
    `- Uninstall instructions: delete ${skillPath.replace('/SKILL.md', '')} to remove the skill instructions; delete ~/.kitcode too if you also want to reset campaign state.`,
    '',
  ].join('\n');
}

export function installSkill(source) {
  const config = sourceConfig(source);
  writeFileAtomic(config.path, kitCodeSkillMarkdown(source));

  return {
    installed: true,
    path: config.path,
  };
}

export function uninstallSkill(source) {
  const config = sourceConfig(source);

  if (fs.existsSync(config.path)) {
    fs.rmSync(config.path);
  }

  return {
    installed: false,
    path: config.path,
  };
}

export function skillStatus(source) {
  const config = sourceConfig(source);

  return {
    installed: fs.existsSync(config.path),
    path: config.path,
  };
}
