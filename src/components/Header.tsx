import { Bell, LayoutGrid, User, MapPinOff } from 'lucide-react';

export function Header({ 
  onToggleToast,
  onNavigateGeoBlock 
}: { 
  onToggleToast: () => void;
  onNavigateGeoBlock?: () => void;
}) {
  return (
    <header className="flex justify-between items-center py-4 px-6 border-b border-brand-border bg-brand-bg shrink-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-widest text-white font-title uppercase">COMMIT THE BREAK</h1>
          <span className="text-brand-red text-xs flex items-center gap-2 tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
            LIVE
          </span>
        </div>
        <div className="text-[10px] text-brand-gray mt-1 tracking-widest uppercase">
          Activity Tracking Dashboard
        </div>
      </div>

      <nav className="flex items-center gap-10 text-xs font-mono text-brand-gray tracking-widest uppercase">
        <button 
          onClick={onNavigateGeoBlock}
          className="flex items-center gap-2 hover:text-white transition-colors"
          title="Simulate Outside Vietnam"
        >
          <MapPinOff size={14} />
          GEO-BLOCK
        </button>
        <button className="flex items-center gap-2 text-brand-red border-b border-brand-red pb-1 -mb-[5px] hover:text-brand-red transition-colors">
          <LayoutGrid size={14} />
          DASHBOARD
        </button>
        <button className="flex items-center gap-2 hover:text-white transition-colors">
          <User size={14} />
          REGISTRATION
        </button>
        <button 
          onClick={onToggleToast}
          className="flex items-center gap-2 hover:text-white transition-colors relative"
        >
          <Bell size={14} />
          THÔNG BÁO
          <div className="w-1.5 h-1.5 rounded-full bg-brand-red absolute -right-3 top-1/2 -translate-y-1/2"></div>
        </button>
        <div className="flex items-center gap-2 text-brand-gray border border-brand-border px-3 py-1.5 rounded-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
          ACTIVE
        </div>
      </nav>
    </header>
  );
}
