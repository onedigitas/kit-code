import { useEffect, useState } from 'react';
import { Folder, RadioTower } from 'lucide-react';
import { SymbolStream } from './symbol-stream';

const installers = [
  { name: 'codex', branch: '|--', canCopy: true },
  { name: 'claude', branch: '|--', canCopy: true },
  { name: 'github', branch: '|--', canCopy: false },
];

export function Sidebar() {
  const [copiedInstaller, setCopiedInstaller] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedInstaller) {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => {
      setCopiedInstaller(null);
    }, 3000);

    return () => window.clearTimeout(resetTimer);
  }, [copiedInstaller]);

  return (
    <aside className="terminal-pane flex min-h-[420px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        explorer
        <span className="ml-auto text-brand-gray">~/kit-code</span>
      </div>

      <div className="border-b border-brand-border p-3">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase text-white">
          <RadioTower size={14} className="text-brand-matcha" />
          LIVE INSTALLATION
        </div>
        <p className="text-[11px] leading-relaxed text-brand-gray">
          Turning Vietnam's code into a national break counter.
        </p>
      </div>

      <div className="border-b border-brand-border p-3">
        <div className="tree-row" data-hot="true">
          <Folder size={14} />
          <span>kit-code/</span>
        </div>
        <div className="tree-row pl-4">
          <span className="tree-branch">|--</span>
          <Folder size={14} />
          <span>skill-installers/</span>
        </div>
        {installers.map((installer) => (
          <button
            key={installer.name}
            type="button"
            className="tree-row tree-option pl-8"
            onClick={() => {
              if (installer.canCopy) {
                setCopiedInstaller(installer.name);
              }
            }}
          >
            <span className="tree-branch">{installer.branch}</span>
            <span
              className={copiedInstaller === installer.name ? 'tree-copy-status' : 'tree-label'}
            >
              {copiedInstaller === installer.name
                ? `copied ${installer.name} skill`
                : installer.name}
            </span>
            <span className="tree-caret" aria-hidden="true">&lt;</span>
          </button>
        ))}
      </div>

      <div className="terminal-pane-title min-h-[30px]">
        symbol stream
        <span className="ml-auto text-brand-matcha">recording</span>
      </div>

      <SymbolStream />

      <div className="border-t border-brand-border p-3">
        <div className="text-xs font-bold uppercase text-brand-matcha">
          BREAK. TRACK. BUILD.
        </div>
        <div className="mt-2 text-xs uppercase text-white">
          EVERY SYMBOL COUNTS.
        </div>
      </div>
    </aside>
  );
}
