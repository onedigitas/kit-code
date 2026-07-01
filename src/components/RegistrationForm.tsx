import { ArrowRight } from 'lucide-react';

export function RegistrationForm() {
  return (
    <div className="w-[320px] shrink-0 flex flex-col h-full py-2">
      <div className="text-brand-red text-xs mb-4 uppercase tracking-widest flex items-end h-[34px]">
        01. REGISTRATION FORM
      </div>
      
      <div className="bg-brand-panel border border-brand-border p-6 rounded-sm flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1 px-1.5 border border-brand-border rounded-sm text-white font-mono text-[10px]">
            {'</>'}
          </div>
          <h2 className="text-white text-base tracking-widest uppercase font-title font-medium">JOIN THE BREAK</h2>
        </div>
        
        <p className="text-[11px] mb-8 leading-relaxed tracking-wide text-brand-gray">
          Register to start tracking<br/>your coding activity.
        </p>

        <form className="flex flex-col gap-6 flex-1">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2 text-white">
              NAME <span className="text-brand-red">*</span>
            </label>
            <input 
              type="text" 
              defaultValue="Nguyen Van A"
              className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-xs text-brand-gray focus:outline-none focus:border-brand-red transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2 text-white">
              EMAIL <span className="text-brand-red">*</span>
            </label>
            <input 
              type="email" 
              defaultValue="name@company.com"
              className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-xs text-brand-gray focus:outline-none focus:border-brand-red transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2 text-white">
              TEAM / DEPARTMENT <span className="text-brand-red">*</span>
            </label>
            <select className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-xs text-brand-gray focus:outline-none focus:border-brand-red transition-colors appearance-none font-mono">
              <option>- Select team -</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest mb-2 text-white">
              NOTES
            </label>
            <textarea 
              placeholder="Any additional info... (optional)"
              className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-xs text-brand-gray focus:outline-none focus:border-brand-red transition-colors h-24 resize-none font-mono"
            ></textarea>
          </div>

          <button type="button" className="w-full border border-brand-red text-brand-red hover:bg-brand-red hover:text-white transition-all py-3 px-4 flex items-center justify-between text-xs tracking-widest mt-auto rounded-sm uppercase group">
            <span className="flex-1 text-center pl-4">SUBMIT</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
