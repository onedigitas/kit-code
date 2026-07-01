import { Bell, Clock, FileText, Gift, Globe, Pause, Save, X } from 'lucide-react';

const StatCard = ({ icon: Icon, textIcon, title, value, subValue, highlight = false }: any) => (
  <div className="bg-transparent border border-brand-border p-4 rounded-sm flex flex-col justify-between h-[110px]">
    <div className="flex flex-col gap-3">
      {textIcon ? (
        <div className="text-white font-mono text-xs">{textIcon}</div>
      ) : (
        <Icon size={16} className="text-white" />
      )}
      <div className="text-[10px] uppercase tracking-widest text-brand-gray leading-tight">{title}</div>
    </div>
    <div>
      <div className={`text-2xl font-light ${highlight ? 'text-brand-red' : 'text-brand-red'}`}>{value}</div>
      {subValue && <div className="text-[10px] mt-1 text-brand-gray">{subValue}</div>}
    </div>
  </div>
);

export function ActivityDashboard({ onOpenToast }: { onOpenToast: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full py-2">
      <div className="text-brand-red text-xs mb-4 uppercase tracking-widest flex justify-between items-end h-[34px]">
        <span>02. ACTIVITY DASHBOARD</span>
        
        <div className="flex gap-4 items-center">
          <button className="border border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-4 py-1.5 rounded-sm flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors">
            <Gift size={12} />
            NHẬN QUÀ
          </button>
          <button 
            onClick={onOpenToast}
            className="border border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-4 py-1.5 rounded-sm flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors relative"
          >
            <Bell size={12} />
            THÔNG BÁO
          </button>
          <div className="border border-brand-border px-4 py-1.5 rounded-sm flex items-center gap-2 text-[10px] text-brand-gray uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
            ACTIVE
          </div>
        </div>
      </div>

      <div className="bg-transparent flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Top actions & session info */}
        <div className="flex justify-between items-center text-xs text-brand-gray">
          <div>
            Session: 12m 14s
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-7 gap-4 shrink-0">
          <StatCard textIcon="</>" title="KEYSTROKES" value="0" subValue="0 / min" />
          <StatCard textIcon="=" title="EQUAL (=) PRESSES" value="0" />
          <StatCard icon={Save} title="SAVES" value="1" />
          <StatCard icon={Clock} title="ACTIVE TIME" value="2m 45s" />
          <StatCard textIcon="||" title="IDLE TIME" value="9m 29s" />
          <StatCard textIcon="{}" title="FILES CREATED" value="0" />
          <StatCard icon={X} title="FILES DELETED" value="0" />
        </div>

        {/* Language Breakdown */}
        <div className="border border-brand-border bg-brand-panel p-4 rounded-sm shrink-0">
          <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest text-white">
            <Globe size={14} className="text-brand-gray" />
            LANGUAGE BREAKDOWN
          </div>
          
          <div className="flex gap-4">
             <div className="border border-brand-border bg-black p-3 rounded-sm min-w-[150px]">
               <div className="text-xs mb-1 text-white">jsonc</div>
               <div className="text-[10px] text-brand-gray mb-3">0 keys • 1 saves</div>
               <div className="w-full bg-brand-border h-[2px] rounded-full overflow-hidden">
                 <div className="bg-brand-red h-full" style={{ width: '10%' }}></div>
               </div>
             </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="border border-brand-border bg-brand-panel rounded-sm flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-brand-border flex items-center gap-2 text-[10px] uppercase tracking-widest text-white shrink-0">
            <FileText size={14} className="text-brand-gray" />
            RECENT EVENTS
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-brand-panel">
                <tr className="text-[10px] uppercase tracking-widest border-b border-brand-border text-brand-gray">
                  <th className="pb-3 font-normal w-1/4">TIME</th>
                  <th className="pb-3 font-normal w-1/4">TYPE</th>
                  <th className="pb-3 font-normal">DETAIL</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '11:22:55 AM', type: 'IDLE END', detail: 'Activity resumed' },
                  { time: '11:20:06 AM', type: 'IDLE START', detail: 'Idle after 5 min inactivity' },
                  { time: '11:19:57 AM', type: 'IDLE END', detail: 'Activity resumed' },
                  { time: '11:16:56 AM', type: 'IDLE START', detail: 'Idle after 5 min inactivity' },
                  { time: '11:16:46 AM', type: 'IDLE END', detail: 'Activity resumed' },
                  { time: '11:16:36 AM', type: 'IDLE START', detail: 'Idle after 5 min inactivity' },
                  { time: '11:16:34 AM', type: 'IDLE END', detail: 'Activity resumed' },
                  { time: '11:16:31 AM', type: 'IDLE START', detail: 'Idle after 5 min inactivity' },
                ].map((event, i) => (
                  <tr key={i} className="border-b border-brand-border last:border-0 hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 text-brand-gray">{event.time}</td>
                    <td className="py-3 text-brand-red">{event.type}</td>
                    <td className="py-3 text-brand-gray">{event.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
