import { GitBranch, LayoutGrid, MapPinOff, Shield, Terminal } from 'lucide-react';

type HeaderView = 'dashboard' | 'admin' | 'geoblock';

export function Header({
  activeView,
  onNavigateAdmin,
  onNavigateDashboard,
  onNavigateGeoBlock,
}: {
  activeView: HeaderView;
  onNavigateAdmin: () => void;
  onNavigateDashboard: () => void;
  onNavigateGeoBlock?: () => void;
}) {
  return (
    <header className="vim-tabline min-h-[72px] shrink-0 flex-col items-stretch justify-start border-b lg:min-h-[66px]">
      <div className="flex min-h-[34px] items-center justify-between border-b border-brand-border">
        <div className="flex min-w-0 items-center">
          <div className="vim-tab shrink-0 whitespace-nowrap text-white" data-active="true">
            <Terminal size={14} className="text-brand-matcha" />
            <span className="font-title text-xl">COMMIT THE BREAK</span>
          </div>
          <div className="vim-tab hidden md:inline-flex">
            <GitBranch size={13} />
            <span>main</span>
          </div>
          <div className="vim-tab hidden xl:inline-flex">
            <span className="text-brand-matcha">[on]</span>
            <span>campaign live</span>
          </div>
        </div>
        <div className="hidden items-center gap-3 px-3 text-[10px] text-brand-gray md:flex">
          <span>activity-tracking-dashboard</span>
          <span className="cursor-block"> </span>
        </div>
      </div>

      <nav className="flex min-h-[34px] items-center overflow-x-auto">
        <button className="vim-tab" data-active={activeView === 'dashboard'} onClick={onNavigateDashboard} type="button">
          <LayoutGrid size={14} />
          dashboard.tsx
        </button>
        <button className="vim-tab" data-active={activeView === 'admin'} onClick={onNavigateAdmin} type="button">
          <Shield size={14} />
          admin.tsx
        </button>
        <button 
          className="vim-tab"
          data-active={activeView === 'geoblock'}
          onClick={onNavigateGeoBlock}
          title="Simulate Outside Vietnam"
          type="button"
        >
          <MapPinOff size={14} />
          geoblock.tsx
        </button>
        <div className="ml-auto hidden h-full items-center gap-2 border-l border-brand-border px-3 text-[10px] text-brand-gray lg:flex">
          <span className="h-1.5 w-1.5 bg-[#10B981]"></span>
          active
        </div>
      </nav>
    </header>
  );
}
