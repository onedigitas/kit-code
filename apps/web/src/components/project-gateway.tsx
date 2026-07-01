import { Folder, Server, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Summary } from '../lib/kitcode-api';

function Shell({ children, status }: { children: ReactNode; status: string }) {
  return (
    <div className="h-screen bg-brand-bg p-3 text-brand-gray font-mono selection:bg-brand-red selection:text-white">
      <div className="terminal-frame flex h-full flex-col overflow-hidden">
        <div className="vim-tabline min-h-[34px] items-center justify-between border-b">
          <div className="vim-tab text-white" data-active="true">
            <Terminal size={14} className="text-brand-red" />
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

function CommandLine({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 border border-brand-border bg-brand-bg px-3 py-2 text-xs text-white">
      <span className="text-brand-red">$</span> {children}
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
  if (!isConnected) {
    return (
      <Shell status={isChecking ? 'checking localhost:4747' : 'waiting'}>
        <section className="terminal-pane w-full max-w-xl border-brand-red p-5" data-active="true">
          <div className="mb-3 flex items-center gap-2 text-sm uppercase text-white">
            <Server size={16} className="text-brand-red" />
            waiting for local KitCode server
          </div>
          <p className="text-xs leading-relaxed text-brand-gray">
            Start the local daemon once, then add projects from any git repo you want to track.
          </p>
          <CommandLine>npx kitcode serve</CommandLine>
          <CommandLine>npx kitcode add .</CommandLine>
        </section>
      </Shell>
    );
  }

  const totalProjects = summary?.global.totalProjects ?? 0;

  if (totalProjects === 0) {
    return (
      <Shell status="connected">
        <section className="terminal-pane w-full max-w-xl p-5" data-active="true">
          <div className="mb-3 flex items-center gap-2 text-sm uppercase text-white">
            <Folder size={16} className="text-brand-red" />
            no projects registered
          </div>
          <p className="text-xs leading-relaxed text-brand-gray">
            Add a project from inside any git repository. The dashboard only receives aggregate developer stats.
          </p>
          <CommandLine>npx kitcode add .</CommandLine>
        </section>
      </Shell>
    );
  }

  return null;
}
