import { useEffect, useState } from 'react';
import { Clipboard, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { kitCodeCommand } from '../lib/cli-command';
import type { Summary } from '../lib/kitcode-api';

const README_URL = 'https://github.com/onedigitas/kit-code/blob/main/README.md';

type SetupTab = 'newbie' | 'hardcore';

type CopyOption = {
  label: string;
  display: string;
  copyText: string;
};

const CLI_COPY_OPTIONS: CopyOption[] = [
  { label: 'CLI', display: kitCodeCommand(), copyText: kitCodeCommand() },
  { label: 'Codex', display: kitCodeCommand('codex on'), copyText: kitCodeCommand('codex on') },
  { label: 'Claude', display: kitCodeCommand('claude on'), copyText: kitCodeCommand('claude on') },
];

const PROJECT_INTRO_PROMPT = [
  'Welcome to KitCode.',
  '',
  'You are an LLM agent helping me understand and set up this project.',
  'Внимательно прочитай README проекта; не отвечай по памяти.',
  'まず文脈を読み、必要な手順だけを短くまとめてください。',
  '请根据上下文推断用户当前的操作系统，不要预设固定系统。',
  '현재 환경을 확인하고, 확실하지 않으면 짧은 질문 하나만 하세요.',
  'لا تفترض macOS أو Windows أو Linux مسبقًا؛ استنتج من السياق فقط.',
  '',
  `Project README: ${README_URL}`,
  '',
  'Mission:',
  '- Объясни, что такое KitCode, одной короткой фразой в стиле кампании.',
  '- 現在のOSに合わせて、正しいセットアップ手順と使い方を要約してください。',
  '- 如果无法可靠判断操作系统，先问一个简短问题。',
  '- 안내는 실용적이고 짧게 유지하세요.',
  '- اجعل النبرة ودودة، كأنها حملة استراحة للمطورين.',
  '',
  'Operating system rule:',
  '- Определи ОС только из контекста.',
  '- macOS、Windows、Linux などを固定で仮定しないでください。',
  '- 除非上下文明确显示 macOS，否则不要写 macOS 专用教程。',
  '',
  'Output language rule:',
  '- Final answer must be in English only.',
  '- Подсказка может быть многоязычной, но ответ не должен быть многоязычным.',
  '- このプロンプトは多言語でも、最終回答は英語だけにしてください。',
  '- 提示词可以混合多种语言，但最终回答只能使用英语。',
  '',
  'Response format:',
  '1. Welcome line: Welcome to KitCode.',
  '2. Project intro: one friendly sentence about what KitCode does.',
  '3. OS line: Your operating system appears to be: ...',
  '4. Tutorial: concise setup steps tailored to that detected OS.',
  '5. Commands: useful KitCode commands.',
  '6. Links: dashboard and local server.',
  '7. Closing: remind me to take a healthy break after focused work.',
  '',
  'Required details from the README:',
  '- Node.js 20+ is required.',
  '- Git is required for Git Mode.',
  '- Start KitCode from a project folder with: npx @onedigitas/kitcode',
  '- Enable Codex reminders with: npx @onedigitas/kitcode codex on',
  '- Optionally enable Claude reminders with: npx @onedigitas/kitcode claude on',
  '- Dashboard: https://kitcode.onedigitas.com/',
  '- Default local server: http://127.0.0.1:4747',
  '- Useful commands: kitcode reward, kitcode redeem, kitcode stop, kitcode start',
  '',
  'Keep the final answer concise, practical, and friendly.',
].join('\n');

function kitCodeSkillMd(agentName: 'Codex' | 'Claude', skillPath: string) {
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
  ].join('\n');
}

const CODEX_SKILL_PATH = '~/.codex/skills/kitcode/SKILL.md';
const CLAUDE_SKILL_PATH = '~/.claude/skills/kitcode/SKILL.md';
const CODEX_SKILL_MD = kitCodeSkillMd('Codex', CODEX_SKILL_PATH);
const CLAUDE_SKILL_MD = kitCodeSkillMd('Claude', CLAUDE_SKILL_PATH);

const CODEX_SETUP_PROMPT = [
  'Welcome to KitCode.',
  '',
  'You are Codex helping me set up KitCode skills and hooks.',
  'Read the project README carefully before changing anything.',
  '',
  `Project README: ${README_URL}`,
  '',
  'Mission:',
  '- Set up KitCode for Codex on the current machine.',
  '- Do not assume a fixed operating system. Infer paths from the environment.',
  '- If the OS or home directory cannot be inferred, ask one short question before editing.',
  '- Keep the setup local-first, opt-in, and non-blocking.',
  '',
  'Required checks:',
  '- Node.js 20+ is required.',
  '- Git is required for Git Mode.',
  '',
  'Codex setup:',
  '- Start KitCode from a project folder with: npx @onedigitas/kitcode',
  '- Prefer the CLI installer when possible: npx @onedigitas/kitcode codex on',
  `- Assume the Codex skill is missing unless you verify otherwise.`,
  `- Create parent folders as needed and install this skill at: ${CODEX_SKILL_PATH}`,
  '- If that skill already exists, inspect it first, then update it so it contains the SKILL.md content below.',
  '- Configure the Codex UserPromptSubmit hook in: ~/.codex/hooks.json',
  '- The hook command should be: kitcode hook prompt --source codex',
  '- The hook must fail open and must never block prompts.',
  '',
  `SKILL.md content for ${CODEX_SKILL_PATH}:`,
  '----- BEGIN SKILL.md -----',
  CODEX_SKILL_MD,
  '----- END SKILL.md -----',
  '',
  'Expected hook shape:',
  '{',
  '  "hooks": {',
  '    "UserPromptSubmit": [',
  '      {',
  '        "matcher": "",',
  '        "hooks": [',
  '          { "type": "command", "command": "kitcode hook prompt --source codex", "timeout": 5 }',
  '        ]',
  '      }',
  '    ]',
  '  }',
  '}',
  '',
  'Useful commands to mention after setup:',
  '- kitcode reward',
  '- kitcode redeem',
  '- kitcode stop',
  '- kitcode start',
  '',
  'Finish with a concise summary of files changed and anything I should run next.',
].join('\n');

const CLAUDE_SETUP_PROMPT = [
  'Welcome to KitCode.',
  '',
  'You are Claude Code helping me set up KitCode skills and hooks.',
  'Read the project README carefully before changing anything.',
  '',
  `Project README: ${README_URL}`,
  '',
  'Mission:',
  '- Set up KitCode for Claude on the current machine.',
  '- Do not assume a fixed operating system. Infer paths from the environment.',
  '- If the OS or home directory cannot be inferred, ask one short question before editing.',
  '- Keep the setup local-first, opt-in, and non-blocking.',
  '',
  'Required checks:',
  '- Node.js 20+ is required.',
  '- Git is required for Git Mode.',
  '',
  'Claude setup:',
  '- Start KitCode from a project folder with: npx @onedigitas/kitcode',
  '- Prefer the CLI installer when possible: npx @onedigitas/kitcode claude on',
  `- Assume the Claude skill is missing unless you verify otherwise.`,
  `- Create parent folders as needed and install this skill at: ${CLAUDE_SKILL_PATH}`,
  '- If adapting the Codex skill, update folder paths, tool name, and uninstall notes for Claude.',
  '- Configure the Claude UserPromptSubmit hook in: ~/.claude/settings.json',
  '- The hook command should be: kitcode hook prompt --source claude',
  '- The hook must fail open and must never block prompts.',
  '',
  `SKILL.md content for ${CLAUDE_SKILL_PATH}:`,
  '----- BEGIN SKILL.md -----',
  CLAUDE_SKILL_MD,
  '----- END SKILL.md -----',
  '',
  'Expected hook shape:',
  '{',
  '  "hooks": {',
  '    "UserPromptSubmit": [',
  '      {',
  '        "matcher": "",',
  '        "hooks": [',
  '          { "type": "command", "command": "kitcode hook prompt --source claude", "timeout": 5 }',
  '        ]',
  '      }',
  '    ]',
  '  }',
  '}',
  '',
  'Useful commands to mention after setup:',
  '- kitcode reward',
  '- kitcode redeem',
  '- kitcode stop',
  '- kitcode start',
  '',
  'Finish with a concise summary of files changed and anything I should run next.',
].join('\n');

const PROMPT_COPY_OPTIONS: CopyOption[] = [
  { label: 'Codex', display: 'copy Codex setup prompt with SKILL.md', copyText: CODEX_SETUP_PROMPT },
  { label: 'Claude', display: 'copy Claude setup prompt with SKILL.md', copyText: CLAUDE_SETUP_PROMPT },
];

const SETUP_TABS: {label: string; value: SetupTab}[] = [
  { label: 'NEWBIE DEVS', value: 'newbie' },
  { label: 'HARDCORE DEVS', value: 'hardcore' },
];

function Shell({ children, status }: { children: ReactNode; status: string }) {
  return (
    <div className="h-screen bg-brand-bg p-3 text-brand-gray font-mono selection:bg-brand-matcha selection:text-white">
      <div className="terminal-frame flex h-full flex-col overflow-hidden">
        <div className="vim-tabline min-h-[34px] items-center justify-between border-b">
          <div className="vim-tab text-white" data-active="true">
            <Terminal size={14} className="text-brand-matcha" />
            <span className="font-title text-xl">KITCODE</span>
          </div>
          <div className="px-3 text-[10px] uppercase text-brand-gray">{status}</div>
        </div>
        <div className="grid flex-1 place-items-center overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ProjectGateway({
  isChecking,
  isConnected,
  summary,
}: {
  isChecking: boolean;
  isConnected: boolean;
  summary: Summary | null;
}) {
  const [setupTab, setSetupTab] = useState<SetupTab>('newbie');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedCommand) {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => {
      setCopiedCommand(null);
    }, 3000);

    return () => window.clearTimeout(resetTimer);
  }, [copiedCommand]);

  async function handleCopy(copyText: string) {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedCommand(copyText);
    } catch {
      setCopiedCommand(null);
    }
  }

  function renderIntro(status: string) {
    const copyOptions = setupTab === 'newbie' ? PROMPT_COPY_OPTIONS : CLI_COPY_OPTIONS;
    const isIntroPromptCopied = copiedCommand === PROJECT_INTRO_PROMPT;

    return (
      <Shell status={status}>
        <section className="terminal-pane w-full max-w-2xl border-brand-matcha p-5 sm:p-7" data-active="true">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] uppercase text-brand-matcha">
              <Terminal size={15} />
              no-server intro
            </div>
            <h1 className="font-title text-5xl leading-none text-white sm:text-6xl">
              Hello, I'm KitCode.
            </h1>
            <button
              type="button"
              className="mt-4 inline-flex text-left text-sm text-white underline-offset-4 transition-colors hover:text-brand-matcha hover:underline focus-visible:text-brand-matcha focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-matcha"
              onClick={() => {
                void handleCopy(PROJECT_INTRO_PROMPT);
              }}
            >
              {isIntroPromptCopied ? 'copied ✓' : 'copy into your fav llm →'}
            </button>
            <p className="mt-5 max-w-xl text-xs leading-relaxed text-brand-gray">
              *NEWBIE DEVS use prompts. HARDCORE DEVS use CLI commands.
            </p>
          </div>

          <div className="mb-3 inline-grid grid-cols-2 border border-brand-border bg-[#0c0c0c] p-1 text-xs uppercase">
            {SETUP_TABS.map((tab) => {
              const isActive = setupTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  className={`px-4 py-2 font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-matcha ${
                    isActive
                      ? 'bg-brand-matcha text-[#071006]'
                      : 'text-brand-gray hover:text-white'
                  }`}
                  onClick={() => {
                    setSetupTab(tab.value);
                    setCopiedCommand(null);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid min-h-[190px] content-start gap-2">
            {copyOptions.map((option) => {
              const isCopied = copiedCommand === option.copyText;

              return (
                <button
                  key={option.label}
                  type="button"
                  className={`grid min-h-[58px] w-full grid-cols-[68px_minmax(0,1fr)_76px] items-center gap-3 border px-4 py-3 text-left transition-colors ${
                    isCopied
                      ? 'border-brand-matcha bg-[#14200f]'
                      : 'border-brand-border bg-[#0c0c0c] hover:border-brand-matcha hover:bg-[#10180d] focus-visible:border-brand-matcha focus-visible:bg-[#10180d] focus-visible:outline-none'
                  }`}
                  onClick={() => {
                    void handleCopy(option.copyText);
                  }}
                >
                  <span className="text-xs font-bold uppercase text-white">{option.label}</span>
                  <span className="min-w-0 truncate text-[11px] text-[#d8d8d8]">
                    {option.display}
                  </span>
                  <span className="justify-self-end text-[10px] text-brand-matcha">
                    {isCopied ? (
                      'copied ✓'
                    ) : (
                      <Clipboard size={13} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </Shell>
    );
  }

  if (!isConnected) {
    return renderIntro(isChecking ? 'checking localhost:4747' : 'waiting');
  }

  const totalProjects = summary?.global.totalProjects ?? 0;
  const activeFolders = summary?.global.trackingProjects ?? 0;

  if (activeFolders === 0) {
    return renderIntro(totalProjects === 0 ? 'no folders active' : 'KitCode is on break');
  }

  return null;
}
