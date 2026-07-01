import { AlertTriangle, Globe2, Terminal } from 'lucide-react';
import { SymbolStream } from './symbol-stream';

export function GeoBlockView() {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-auto bg-brand-bg p-3 font-mono text-brand-gray selection:bg-brand-matcha selection:text-white">
      <div className="terminal-frame flex w-full max-w-[1120px] flex-col overflow-hidden">
        <header className="vim-tabline min-h-[68px] shrink-0 flex-col items-stretch border-b">
          <div className="flex min-h-[34px] items-center justify-between border-b border-brand-border">
            <div className="vim-tab shrink-0 whitespace-nowrap text-white" data-active="true">
              <Terminal size={14} className="text-brand-matcha" />
              <span className="font-title text-xl uppercase">COMMIT THE BREAK</span>
            </div>
            <div className="flex items-center gap-2 px-3 text-[10px] uppercase text-brand-matcha">
              <span className="h-1.5 w-1.5 bg-brand-matcha"></span>
              campaign live
            </div>
          </div>
          <div className="flex min-h-[34px] items-center overflow-x-auto">
            <div className="vim-tab" data-active="true">
              <Globe2 size={14} />
              public-notice.md
            </div>
            <div className="vim-tab hidden sm:inline-flex">readonly</div>
            <div className="ml-auto hidden px-3 text-[10px] uppercase text-brand-gray md:block">outside access</div>
          </div>
        </header>

        <main className="grid grid-cols-1 items-start gap-3 p-3 lg:grid-cols-[280px_minmax(0,760px)] lg:justify-center">
          <aside className="terminal-pane flex min-h-[420px] flex-col overflow-hidden">
            <div className="terminal-pane-title">public view</div>
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="mb-4 text-xs uppercase text-brand-matcha">// PUBLIC VIEW</div>
                <p className="text-[11px] leading-[1.8] text-brand-gray">
                  The activity form and dashboard are only available inside Vietnam.
                  This page remains open as a campaign information screen.
                </p>
              </div>

              <SymbolStream className="my-6 h-[220px] shrink-0" />

              <div>
                <div className="text-xs font-bold uppercase text-brand-matcha">BREAK. TRACK. BUILD.</div>
                <div className="mt-2 text-[11px] text-brand-gray">Every symbol counts.</div>
              </div>
            </div>
          </aside>

          <section className="terminal-pane flex w-full max-w-[760px] flex-col overflow-hidden" data-active="true">
            <div className="terminal-pane-title">
              access notice
              <span className="ml-auto text-brand-matcha">blocked</span>
            </div>
            <div className="p-4 lg:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase text-brand-matcha">
                <AlertTriangle size={15} />
                ACCESS NOTICE
              </div>

              <h1 className="mb-5 font-title text-[42px] uppercase leading-none text-white sm:text-[54px]">
                THANKS FOR
                <br />
                STOPPING BY.
              </h1>

              <div className="max-w-[620px] space-y-3 text-[12px] leading-[1.7] text-brand-gray">
                <p>
                  This campaign is currently designed for developers accessing from Vietnam,
                  where the live coding activity counter is being collected and visualised.
                </p>
                <p>
                  Since you are visiting from outside the country, we are not showing the
                  registration form or private activity dashboard here. You can still learn
                  more about the idea, the symbols we track, and the campaign story.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-brand-border pt-4 text-[11px] text-brand-gray">
                <span><span className="text-white">=</span> equality</span>
                <span><span className="text-brand-matcha">//</span> comment</span>
                <span><span className="text-brand-matcha">||</span> pause</span>
                <span><span className="text-white">Source:</span> public campaign information</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="terminal-button border-brand-matcha text-brand-matcha">
                  FIND OUT MORE -&gt;
                </button>
                <button className="terminal-button border-brand-matcha text-brand-matcha">
                  VISIT CAMPAIGN SITE
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="vim-statusline h-9 shrink-0 justify-between border-t">
          <div className="flex min-w-0 items-center">
            <span className="vim-mode">NORMAL</span>
            <span className="vim-status-segment text-white">public-notice.md</span>
            <span className="vim-status-segment text-brand-matcha">readonly</span>
          </div>
          <div className="flex items-center">
            <span className="vim-status-segment hidden sm:inline-flex">utf-8</span>
            <span className="vim-status-segment">Top</span>
            <span className="vim-status-segment border-r-0 text-white">1:1</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
