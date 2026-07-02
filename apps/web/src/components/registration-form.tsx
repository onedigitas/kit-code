import { FormEvent, useState } from 'react';
import { ArrowRight, Code2 } from 'lucide-react';
import { DeveloperProfileInput } from '../lib/developer-profile';

const teamOptions = ['Engineering', 'Design', 'Product', 'Data', 'Marketing', 'Operations'];

type RegistrationFormErrors = Partial<Record<keyof DeveloperProfileInput, string>>;

export function RegistrationForm({ onSubmit }: { onSubmit: (profile: DeveloperProfileInput) => void }) {
  const [name, setName] = useState('Nguyen Van A');
  const [email, setEmail] = useState('name@company.com');
  const [team, setTeam] = useState('');
  const [notes, setNotes] = useState('');
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      name,
      email,
      team,
      notes,
    });
  }

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

        <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={handleSubmit}>
          <div className="line-row">
            <span className="line-no">01</span>
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] uppercase text-white">
                <Code2 size={12} className="text-brand-matcha" />
                const name <span className="text-brand-matcha">*</span>
              </label>
              <input 
                type="text" 
                aria-invalid={Boolean(errors.name)}
                className="terminal-input"
                onChange={(event) => setName(event.target.value)}
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
                type="email" 
                aria-invalid={Boolean(errors.email)}
                className="terminal-input"
                onChange={(event) => setEmail(event.target.value)}
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
                placeholder="Any additional info... (optional)"
                className="terminal-input min-h-[96px] flex-1 resize-none"
                onChange={(event) => setNotes(event.target.value)}
                value={notes}
              ></textarea>
            </div>
          </div>

          <button type="submit" className="terminal-button mt-auto w-full justify-between border-brand-matcha text-brand-matcha group" data-active="false">
            <span>:write registration</span>
            <span className="ml-auto">SUBMIT</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </section>
  );
}
