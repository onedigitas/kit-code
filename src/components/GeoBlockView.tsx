export function GeoBlockView() {
  return (
    <div className="h-screen bg-brand-bg text-brand-gray font-mono selection:bg-brand-red selection:text-white flex flex-col overflow-hidden items-center justify-center p-8">
      <div className="w-full max-w-[1000px] bg-[#0A0A0A] border border-brand-border flex flex-col h-full max-h-[700px] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-start p-8 border-b border-brand-border shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium tracking-widest text-white font-title uppercase">COMMIT THE BREAK</h1>
            <div className="text-[10px] text-brand-gray mt-2 tracking-widest uppercase">
              Activity Tracking Campaign
            </div>
          </div>
          <div className="text-brand-red text-xs flex items-center gap-2 tracking-widest mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
            CAMPAIGN LIVE
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex p-8 gap-16 overflow-hidden">
          {/* Left Column */}
          <div className="w-[280px] flex flex-col justify-between shrink-0">
            <div>
              <div className="text-brand-red text-xs mb-6 uppercase tracking-widest leading-relaxed">
                // PUBLIC VIEW
              </div>
              <p className="text-[11px] leading-[1.8] text-brand-gray tracking-wide pr-4">
                The activity form and dashboard<br />
                are only available inside Vietnam.<br />
                This page remains open as a<br />
                campaign information screen.
              </p>
            </div>

            <div className="text-brand-gray opacity-40 text-[10px] leading-[14px] font-mono whitespace-pre py-8 tracking-[0.3em]">
              {`
.  :  .  +  .  .  .  :
.  +  +  .  :  .  .  .
+  =  // || +  .  .  .
:  +  +  +  +  .  .  .
.  .  .  .  .  :  .  :
              `}
            </div>

            <div>
              <div className="text-brand-red text-xs uppercase tracking-widest mb-2">
                BREAK. TRACK. BUILD.
              </div>
              <div className="text-brand-gray text-[11px] tracking-wide">
                Every symbol counts.
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 relative border border-brand-border p-10 flex flex-col min-h-0 bg-brand-panel/30">
            <div className="absolute -top-[1px] left-4 bg-[#0A0A0A] border-x border-t border-brand-border px-3 py-1.5 -translate-y-full text-[10px] text-brand-red tracking-widest uppercase">
              // OUTSIDE ACCESS
            </div>

            <div className="flex-1 overflow-auto pr-4">
              <div className="text-brand-red text-xs mb-8 flex items-center gap-2 tracking-widest uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                ACCESS NOTICE
              </div>

              <h2 className="text-[56px] leading-[1.1] font-title font-medium text-white mb-10 tracking-tight">
                THANKS FOR<br />
                STOPPING BY.
              </h2>

              <div className="space-y-6 text-[12px] leading-[1.8] text-brand-gray tracking-wide max-w-[540px]">
                <p>
                  This campaign is currently designed for developers accessing<br />
                  from Vietnam, where the live coding activity counter is being<br />
                  collected and visualised.
                </p>
                <p>
                  Since you are visiting from outside the country, we are not<br />
                  showing the registration form or private activity dashboard<br />
                  here. You can still learn more about the idea, the symbols we<br />
                  track, and the campaign story.
                </p>
              </div>

              <div className="mt-12 pt-6 border-t border-brand-border/50 text-[11px] text-brand-gray flex items-center gap-4">
                <span className="text-white">=</span> equality
                <span className="text-brand-red">//</span> comment
                <span className="text-brand-red">||</span> pause
                <span className="ml-2"><span className="text-white">Source:</span> public campaign information</span>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="border border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-6 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                  FIND OUT MORE &rarr;
                </button>
                <button className="border border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-6 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-colors">
                  VISIT CAMPAIGN SITE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-brand-border py-6 px-8 flex justify-between text-[10px] text-brand-gray tracking-widest shrink-0">
          <div className="flex gap-4 items-center uppercase">
            <span className="text-brand-red">COMMIT THE BREAK</span>
            <span>·</span>
            <span>BREAK. TRACK. BUILD.</span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
