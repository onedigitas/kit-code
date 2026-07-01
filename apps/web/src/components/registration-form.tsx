import { ArrowRight, Code2 } from 'lucide-react';

export function RegistrationForm() {
  return (
    <section className="terminal-pane flex min-h-[560px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        registration.tsx
        <span className="ml-auto text-brand-gray">modified</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-5 flex items-center gap-3 border-b border-brand-border pb-4">
          <div className="border border-brand-border px-2 py-1 text-[10px] text-white">
            {'</>'}
          </div>
          <div>
            <h2 className="font-title text-2xl font-medium uppercase text-white">JOIN THE BREAK</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-brand-gray">
              Register to start tracking your coding activity.
            </p>
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="line-row">
            <span className="line-no">01</span>
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] uppercase text-white">
                <Code2 size={12} className="text-brand-red" />
                const name <span className="text-brand-red">*</span>
              </label>
              <input 
                type="text" 
                defaultValue="Nguyen Van A"
                className="terminal-input"
              />
            </div>
          </div>

          <div className="line-row">
            <span className="line-no">02</span>
            <div>
              <label className="mb-2 block text-[10px] uppercase text-white">
                const email <span className="text-brand-red">*</span>
              </label>
              <input 
                type="email" 
                defaultValue="name@company.com"
                className="terminal-input"
              />
            </div>
          </div>

          <div className="line-row">
            <span className="line-no">03</span>
            <div>
              <label className="mb-2 block text-[10px] uppercase text-white">
                const team <span className="text-brand-red">*</span>
              </label>
              <select className="terminal-input appearance-none">
                <option>- Select team -</option>
              </select>
            </div>
          </div>

          <div className="line-row min-h-0 flex-1">
            <span className="line-no">04</span>
            <div className="flex min-h-0 flex-col">
              <label className="mb-2 block text-[10px] uppercase text-white">
                // notes
              </label>
              <textarea 
                placeholder="Any additional info... (optional)"
                className="terminal-input min-h-[96px] flex-1 resize-none"
              ></textarea>
            </div>
          </div>

          <button type="button" className="terminal-button mt-auto w-full justify-between border-brand-red text-brand-red group" data-active="false">
            <span>:write registration</span>
            <span className="ml-auto">SUBMIT</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </section>
  );
}
