import { Clock, Equal, Info, Save, Settings, X, Square } from 'lucide-react';

export function Toast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 border border-brand-border bg-[#0A0A0A] p-5 rounded-sm flex flex-col gap-5 shadow-2xl w-[600px] z-50">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-brand-gray">
          <Info size={16} className="text-white" />
          <div className="flex items-center gap-2">
            <Square size={14} className="text-white" />
            <span className="text-white">0 keys</span>
          </div>
          <span className="text-brand-red">•</span>
          <div className="flex items-center gap-2">
            <Equal size={14} className="text-brand-red" />
            <span className="text-white">0 equal</span>
          </div>
          <span className="text-brand-red">•</span>
          <div className="flex items-center gap-2">
            <Save size={14} className="text-white" />
            <span className="text-white">1 saves</span>
          </div>
          <span className="text-brand-red">•</span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white" />
            <span className="text-white">2m active</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Settings size={16} className="text-brand-gray hover:text-white cursor-pointer transition-colors" />
          <X onClick={onClose} size={16} className="text-brand-gray hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-brand-gray">Source: Coding Activity Tracker Dashboard</div>
        <div className="flex gap-3">
          <button className="border border-brand-red text-brand-red px-6 py-2 rounded-sm text-[10px] uppercase tracking-widest hover:bg-brand-red hover:text-white transition-colors">
            NHẬN QUÀ
          </button>
          <button onClick={onClose} className="border border-brand-border text-brand-gray px-6 py-2 rounded-sm text-[10px] uppercase tracking-widest hover:border-brand-gray hover:text-white transition-colors">
            LÀM TIẾP
          </button>
        </div>
      </div>
    </div>
  );
}
