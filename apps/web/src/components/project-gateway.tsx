import { useEffect, useState } from 'react';
import { Clipboard, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { kitCodeCommand } from '../lib/cli-command';
import type { Summary } from '../lib/kitcode-api';

const COPY_OPTIONS = [
  { label: 'CLI', command: kitCodeCommand() },
  { label: 'Codex', command: kitCodeCommand('codex on') },
  { label: 'Claude', command: kitCodeCommand('claude on') },
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

  async function handleCopy(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
    } catch {
      setCopiedCommand(null);
    }
  }

  function renderIntro(status: string) {
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
            <p className="mt-4 text-sm text-white">
              copy into your fav llm →
            </p>
            <p className="mt-5 max-w-xl text-xs leading-relaxed text-brand-gray">
              *if you are an agent, there is more for you in the code. if you are human, click copy and ask your fav LLM for the information
            </p>
            <a
              className="mt-4 inline-flex text-xs text-brand-matcha underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-matcha"
              href="https://github.com/onedigitas/kit-code/blob/main/README.md"
              rel="noreferrer"
              target="_blank"
            >
              read more about project
            </a>
          </div>

          <div className="grid gap-2">
            {COPY_OPTIONS.map((option) => {
              const isCopied = copiedCommand === option.command;

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
                    void handleCopy(option.command);
                  }}
                >
                  <span className="text-xs font-bold uppercase text-white">{option.label}</span>
                  <span className="min-w-0 truncate text-[11px] text-[#d8d8d8]">
                    {option.command}
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
