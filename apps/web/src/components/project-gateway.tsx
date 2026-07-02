import { useEffect, useState } from 'react';
import { Clipboard, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  kitCodeCommand,
  setupPromptFor,
} from '../../../../packages/kitcode-cli/src/integration-spec.mjs';
import type { Summary } from '../lib/kitcode-api';

const README_URL = 'https://github.com/onedigitas/kit-code/blob/main/README.md';
const ENCODED_README_URL = encodeURIComponent(README_URL);
const LANDING_URL = 'https://kitcode.onedigitas.com/';
const ENCODED_LANDING_URL = encodeURIComponent(LANDING_URL);

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
  'You are an LLM. Explain this campaign and help me start using it.',
  'Đọc context, viết đủ ý: vừa campaign intro, vừa setup tutorial dễ hiểu.',
  '雰囲気とストーリーを伝えてから、必要なセットアップ手順も案内してください。',
  '请用轻松、友好的方式说明这个开发者休息活动，并给出上手步骤。',
  '캠페인 소개처럼 따뜻하게 말하고, 초보자와 숙련자 경로를 나눠 주세요.',
  'اشرح الفكرة كحملة استراحة للمطورين، ثم اعرض خطوات البدء ببساطة.',
  '',
  `Project README, URL-encoded: ${ENCODED_README_URL}`,
  `Campaign landing, URL-encoded: ${ENCODED_LANDING_URL}`,
  '',
  'Mission:',
  '- Explain KitCode as a friendly developer break campaign.',
  '- Nói rõ app/campaign này là gì, dành cho ai, và giúp developer như thế nào.',
  '- やさしい言葉で、集中・進捗・休憩リワード・キャンペーン体験・セットアップを説明する。',
  '- Detect my OS from context if possible. If you can detect it, show setup for that OS only.',
  '- 如果不能可靠判断操作系统，不要问问题；直接给 macOS, Windows, and Linux setup options.',
  '- 설치 단계는 포함하되, 너무 깊은 implementation details, paths, hooks 설명은 길게 쓰지 마세요.',
  '- Do not call it a desktop app unless the README clearly says that. Describe it as a campaign experience, web dashboard, and local-first developer companion.',
  '- Keep the tone playful, human, and campaign-friendly.',
  '',
  'Required setup facts:',
  '- Node.js 20+ is required.',
  '- Git is useful for Git Mode.',
  '- Start from a project folder with: npx @onedigitas/kitcode',
  '- Codex helper setup: npx @onedigitas/kitcode codex on',
  '- Claude helper setup: npx @onedigitas/kitcode claude on',
  '- Dashboard / campaign landing: https://kitcode.onedigitas.com/',
  '- Local server default: http://127.0.0.1:4747',
  '- Useful commands: kitcode reward, kitcode redeem, kitcode stop, kitcode start',
  '',
  'Audience paths:',
  '- Newbie path: explain what to do first, which setup button/prompt to copy, and how an LLM agent can help them set it up.',
  '- Hardcore path: explain the direct CLI method, the Codex/Claude methods, and when to use each method.',
  '- Include a short learn-more line that points to the campaign landing website.',
  '',
  'Output language rule:',
  '- Final answer should be simple English, even though this prompt is mixed-language.',
  '',
  'Response format:',
  '1. Short title: KitCode in plain English.',
  '2. Opening: 2-3 friendly sentences that introduce the campaign idea.',
  '3. What it is: one short paragraph explaining the app/campaign.',
  '4. What it does: 4-5 bullets covering focused coding activity, progress visibility, break reminders, KitKat-style rewards, and the dashboard experience.',
  '5. Setup tutorial: detect OS if possible; otherwise show macOS, Windows, and Linux options with short command examples.',
  '6. Newbie vs Hardcore: explain what each type should do and which method fits them.',
  '7. Learn more: include the campaign landing website.',
  '8. Closing: one warm line inviting me to keep coding and take a proper break.',
  '',
  'Length: around 550-800 words.',
  'Keep it clear, friendly, campaign-ready, and practical without becoming a deep technical manual.',
].join('\n');

const CODEX_SETUP_PROMPT = setupPromptFor('codex', {readmeUrl: README_URL});
const CLAUDE_SETUP_PROMPT = setupPromptFor('claude', {readmeUrl: README_URL});

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
          <div className="flex self-stretch items-center px-3 text-[10px] uppercase text-brand-gray">{status}</div>
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
  const [waitingDotCount, setWaitingDotCount] = useState(1);

  useEffect(() => {
    if (!copiedCommand) {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => {
      setCopiedCommand(null);
    }, 3000);

    return () => window.clearTimeout(resetTimer);
  }, [copiedCommand]);

  useEffect(() => {
    if (isConnected || isChecking) {
      setWaitingDotCount(1);
      return undefined;
    }

    const dotTimer = window.setInterval(() => {
      setWaitingDotCount((currentCount) => currentCount === 3 ? 1 : currentCount + 1);
    }, 420);

    return () => window.clearInterval(dotTimer);
  }, [isChecking, isConnected]);

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
            <h1 className="font-title text-5xl leading-none text-white sm:text-6xl">
              Hello, I'm KitCode.
            </h1>
            <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-brand-matcha">
              <Terminal className="mt-0.5 shrink-0" size={15} />
              A local-first break companion for developers that tracks aggregate coding activity, unlocks KitKat-style rewards.
            </div>
            <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-brand-matcha">
              <Terminal className="mt-0.5 shrink-0" size={15} />
              If you are an agent, there is more for you in the code.
              <br />
              If you are human, click copy and ask your fav LLM for the information.
            </div>
            <button
              type="button"
              className="mt-5 inline-flex text-left text-sm text-white underline-offset-4 transition-colors hover:text-brand-matcha hover:underline focus-visible:text-brand-matcha focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-matcha"
              onClick={() => {
                void handleCopy(PROJECT_INTRO_PROMPT);
              }}
            >
              {isIntroPromptCopied ? 'copied ✓' : 'copy into your fav llm →'}
            </button>
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
    return renderIntro(isChecking ? 'checking localhost:4747' : `waiting for connection${'.'.repeat(waitingDotCount)}`);
  }

  const totalProjects = summary?.global.totalProjects ?? 0;
  const activeFolders = summary?.global.trackingProjects ?? 0;

  if (activeFolders === 0) {
    return renderIntro(totalProjects === 0 ? 'no folders active' : 'KitCode is on break');
  }

  return null;
}
