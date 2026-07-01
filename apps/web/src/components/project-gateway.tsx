import { Folder, Server, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Summary } from '../lib/kitcode-api';

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

function CommandLine({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 border border-brand-border bg-brand-bg px-3 py-2 text-xs text-white">
      <span className="text-brand-matcha">$</span> {children}
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
        <section className="terminal-pane w-full max-w-xl border-brand-matcha p-5" data-active="true">
          <div className="mb-3 flex items-center gap-2 text-sm uppercase text-white">
            <Server size={16} className="text-brand-matcha" />
            waiting for local KitCode server
          </div>
          <p className="text-xs leading-relaxed text-brand-gray">
            Run KitCode once inside any folder you want to track.
          </p>
          <CommandLine>npx kitcode</CommandLine>
        </section>
      </Shell>
    );
  }

  const totalProjects = summary?.global.totalProjects ?? 0;
  const activeFolders = summary?.global.trackingProjects ?? 0;

  if (activeFolders === 0) {
    return (
      <Shell status="connected">
        <section className="terminal-pane w-full max-w-xl p-5" data-active="true">
          <div className="mb-3 flex items-center gap-2 text-sm uppercase text-white">
            <Folder size={16} className="text-brand-matcha" />
            {totalProjects === 0 ? 'no folders active' : 'KitCode is on break'}
          </div>
          <p className="text-xs leading-relaxed text-brand-gray">
            Run KitCode inside a folder to turn tracking on. The dashboard only receives aggregate developer stats.
          </p>
          <CommandLine>npx kitcode</CommandLine>
        </section>
      </Shell>
    );
  }

  return null;
}
