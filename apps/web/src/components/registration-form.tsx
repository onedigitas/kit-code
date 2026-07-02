import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Code2, Gift, Server } from 'lucide-react';
import { DeveloperProfileInput } from '../lib/developer-profile';

const teamOptions = ['Engineering', 'Design', 'Product', 'Data', 'Marketing', 'Operations'];
const steps = [1, 2, 3] as const;

type RegistrationFormErrors = Partial<Record<keyof DeveloperProfileInput, string>>;
type RegistrationStep = typeof steps[number];

export function RegistrationForm({ onSubmit }: { onSubmit: (profile: DeveloperProfileInput) => void }) {
  const [step, setStep] = useState<RegistrationStep>(1);
  const [name, setName] = useState('Nguyen Van A');
  const [email, setEmail] = useState('name@company.com');
  const [team, setTeam] = useState('');
  const [notes, setNotes] = useState('');
  const [shareDataConsent, setShareDataConsent] = useState(true);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});

  function validate() {
    const nextErrors: RegistrationFormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    }

    if (!team.trim()) {
      nextErrors.team = 'Team is required.';
    }

    return nextErrors;
  }

  function handleProfileContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStep(2);
  }

  function handleFinalSubmit() {
    onSubmit({
      name,
      email,
      team,
      notes,
      shareDataConsent,
    });
  }

  return (
    <section className="terminal-pane flex min-h-[600px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        registration.tsx
        <span className="ml-auto text-brand-gray">step {step} of 3</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-5 border-b border-brand-border pb-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {steps.map((stepNumber) => (
                <div className="flex items-center gap-2" key={stepNumber}>
                  <span
                    className={[
                      'grid h-7 w-7 place-items-center border text-[11px] font-bold transition-colors',
                      step === stepNumber
                        ? 'border-brand-matcha bg-brand-matcha text-brand-bg shadow-[0_0_16px_rgba(139,195,74,0.36)]'
                        : step > stepNumber
                          ? 'border-brand-matcha text-brand-matcha'
                          : 'border-brand-border text-brand-gray',
                    ].join(' ')}
                  >
                    {step > stepNumber ? <Check size={13} /> : stepNumber}
                  </span>
                  {stepNumber < 3 && (
                    <span
                      className={[
                        'h-px w-8',
                        step > stepNumber ? 'bg-brand-matcha' : 'bg-brand-border',
                      ].join(' ')}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] uppercase text-brand-gray">50% unlock</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="border border-brand-border px-2 py-1 text-[10px] text-white">
              {'</>'}
            </div>
            <div>
              <h2 className="font-title text-2xl font-medium uppercase text-white">
                {step === 1 && 'JOIN THE BREAK'}
                {step === 2 && 'DATA CONSENT'}
                {step === 3 && 'VIBE PACK READY'}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-brand-gray">
                {step === 1 && 'Register to start tracking your coding activity.'}
                {step === 2 && 'Choose how KitCode can use your campaign data.'}
                {step === 3 && 'Your 50% milestone reward is ready to claim.'}
              </p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={handleProfileContinue}>
            <div className="line-row">
              <span className="line-no">01</span>
              <div>
                <label className="mb-2 flex items-center gap-2 text-[10px] uppercase text-white">
                  <Code2 size={12} className="text-brand-matcha" />
                  const name <span className="text-brand-matcha">*</span>
                </label>
                <input
                  aria-invalid={Boolean(errors.name)}
                  className="terminal-input"
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  value={name}
                />
                {errors.name && <div className="mt-1 text-[10px] uppercase text-red-400">{errors.name}</div>}
              </div>
            </div>

            <div className="line-row">
              <span className="line-no">02</span>
              <div>
                <label className="mb-2 block text-[10px] uppercase text-white">
                  const email <span className="text-brand-matcha">*</span>
                </label>
                <input
                  aria-invalid={Boolean(errors.email)}
                  className="terminal-input"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
                {errors.email && <div className="mt-1 text-[10px] uppercase text-red-400">{errors.email}</div>}
              </div>
            </div>

            <div className="line-row">
              <span className="line-no">03</span>
              <div>
                <label className="mb-2 block text-[10px] uppercase text-white">
                  const team <span className="text-brand-matcha">*</span>
                </label>
                <select
                  aria-invalid={Boolean(errors.team)}
                  className="terminal-input appearance-none"
                  onChange={(event) => setTeam(event.target.value)}
                  value={team}
                >
                  <option value="">- Select team -</option>
                  {teamOptions.map((teamOption) => (
                    <option key={teamOption} value={teamOption}>{teamOption}</option>
                  ))}
                </select>
                {errors.team && <div className="mt-1 text-[10px] uppercase text-red-400">{errors.team}</div>}
              </div>
            </div>

            <div className="line-row min-h-0 flex-1">
              <span className="line-no">04</span>
              <div className="flex min-h-0 flex-col">
                <label className="mb-2 block text-[10px] uppercase text-white">
                  // notes
                </label>
                <textarea
                  className="terminal-input min-h-[96px] flex-1 resize-none"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Any additional info... (optional)"
                  value={notes}
                />
              </div>
            </div>

            <button type="submit" className="terminal-button mt-auto w-full justify-between border-brand-matcha text-brand-matcha group" data-active="false">
              <span>:continue</span>
              <span className="ml-auto">CONTINUE</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="terminal-card">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase text-brand-matcha">
                <Server size={14} />
                token storage notice
              </div>
              <p className="text-xs leading-relaxed text-brand-gray">
                KitCode may store a campaign token on the server and locally on your machine to connect this
                registration with reward tracking. Shared performance data is anonymous and used for campaign
                reporting, benchmarks, and product improvement.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                aria-pressed={shareDataConsent}
                className={[
                  'reward-card flex min-h-[116px] items-center justify-between gap-4 p-4 text-left transition-colors',
                  shareDataConsent ? 'reward-card-selected' : '',
                ].join(' ')}
                onClick={() => setShareDataConsent(true)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-bold uppercase text-white">Yes, share my data</span>
                  <span className="mt-2 block text-xs leading-relaxed text-brand-gray">
                    Help improve campaign features, insights, and community benchmarks.
                  </span>
                </span>
                <span className="grid h-8 w-8 shrink-0 place-items-center border border-brand-matcha text-brand-matcha">
                  {shareDataConsent && <Check size={16} />}
                </span>
              </button>

              <button
                aria-pressed={!shareDataConsent}
                className={[
                  'reward-card flex min-h-[104px] items-center justify-between gap-4 p-4 text-left transition-colors',
                  !shareDataConsent ? 'reward-card-selected' : '',
                ].join(' ')}
                onClick={() => setShareDataConsent(false)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-bold uppercase text-white">No, thanks</span>
                  <span className="mt-2 block text-xs leading-relaxed text-brand-gray">
                    Continue without sharing anonymous performance data.
                  </span>
                </span>
                <span className="grid h-8 w-8 shrink-0 place-items-center border border-brand-border text-brand-gray">
                  {!shareDataConsent && <Check size={16} />}
                </span>
              </button>
            </div>

            <div className="mt-auto grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button className="terminal-button justify-center" onClick={() => setStep(1)} type="button">
                <ArrowLeft size={14} />
                BACK
              </button>
              <button className="terminal-button justify-between border-brand-matcha text-brand-matcha group" onClick={() => setStep(3)} type="button">
                <span>:consent saved</span>
                <span className="ml-auto">CONTINUE</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="reward-panel reward-preview-panel-purple grid min-h-[260px] place-items-center overflow-hidden p-4">
              <img
                alt="Purple neon Vibe Pack gift box"
                className="relative z-10 w-[270px] max-w-full"
                src="/reward-purple-pack.png"
              />
            </div>

            <div className="reward-card-purple reward-card p-4">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-brand-matcha">
                <Gift size={14} />
                50% milestone reward
              </div>
              <h3 className="font-title text-3xl font-medium uppercase leading-none text-brand-matcha">Vibe Pack</h3>
              <p className="mt-3 text-xs leading-relaxed text-brand-gray">
                Congrats, {name.trim() || 'developer'}. Your 50% milestone is unlocked. Claim this campaign
                reward and keep your KitCode profile ready for future drops.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button className="terminal-button justify-center" onClick={() => setStep(2)} type="button">
                <ArrowLeft size={14} />
                BACK
              </button>
              <button className="claim-now-button terminal-button justify-between group" onClick={handleFinalSubmit} type="button">
                <span>:claim reward</span>
                <span className="ml-auto">CLAIM 50% REWARD</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
