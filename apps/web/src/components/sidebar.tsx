import { useEffect, useState } from 'react';
import { CalendarDays, Folder, LogOut, LucideIcon, Mail, RadioTower, Trophy, UserRound, UsersRound } from 'lucide-react';
import { globalKitCodeCommand } from '../lib/cli-command';
import { DeveloperProfile } from '../lib/developer-profile';
import { SymbolStream } from './symbol-stream';

const installers = [
  { name: 'codex', branch: '|--', command: globalKitCodeCommand('codex on') },
  { name: 'claude', branch: '|--', command: globalKitCodeCommand('claude on') },
  { name: 'github', branch: '|--', command: null },
];

function formatRegisteredDate(registeredAt: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(registeredAt));
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-brand-border bg-[#080808] p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase text-brand-gray">
        <Icon size={13} className="text-brand-primary" />
        {label}
      </div>
      <div className="break-words text-xs font-bold leading-relaxed text-white">{value}</div>
    </div>
  );
}

function DeveloperLeaderboard({ profile }: { profile: DeveloperProfile }) {
  const leaderboard = [
    {rank: 1, name: 'Minh Tran', score: '98%', badge: 'MT', isCurrentUser: false},
    {rank: 2, name: profile.name, score: '86%', badge: profile.avatarInitials, isCurrentUser: true},
    {rank: 3, name: 'Linh Pham', score: '74%', badge: 'LP', isCurrentUser: false},
    {rank: 4, name: 'An Nguyen', score: '69%', badge: 'AN', isCurrentUser: false},
  ];

  return (
    <div className="border-b border-brand-border p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase text-white">
          <Trophy size={13} className="text-brand-primary" />
          leaderboard
        </div>
        <span className="text-[10px] uppercase text-brand-gray">mock</span>
      </div>

      <div className="grid gap-2">
        {leaderboard.map((developer) => (
          <div
            className={[
              'grid grid-cols-[2.5ch_28px_minmax(0,1fr)_4ch] items-center gap-2 border px-2 py-1.5 text-[11px]',
              developer.isCurrentUser
                ? 'border-brand-primary bg-[rgba(252, 10, 10, 0.14)] text-white'
                : 'border-brand-border bg-[#080808] text-brand-gray',
            ].join(' ')}
            key={`${developer.rank}-${developer.name}`}
          >
            <span className="font-bold text-brand-primary">#{developer.rank}</span>
            <span className="grid h-7 w-7 place-items-center border border-brand-border font-title text-lg leading-none text-white">
              {developer.badge}
            </span>
            <span className="min-w-0 truncate font-bold">{developer.name}</span>
            <span className="text-right font-bold text-brand-primary">{developer.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeveloperProfilePanel({ onLogout, profile }: { onLogout: () => void; profile: DeveloperProfile }) {
  return (
    <aside className="terminal-pane flex min-h-[420px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        developer.profile
        <span className="ml-auto text-brand-primary">authenticated</span>
      </div>

      <div className="border-b border-brand-border p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center border border-brand-primary bg-[rgba(252, 10, 10, 0.16)] font-title text-4xl leading-none text-brand-primary shadow-[0_0_22px_rgba(252, 10, 10, 0.22)]">
            {profile.avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase text-brand-primary">
              <UserRound size={12} />
              SESSION AUTHENTICATED
            </div>
            <h2 className="mt-2 break-words font-title text-3xl uppercase leading-none text-white">
              {profile.name}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-brand-border p-3">
        <ProfileField icon={Mail} label="email" value={profile.email} />
        <ProfileField icon={UsersRound} label="team" value={profile.team} />
        <ProfileField icon={CalendarDays} label="registered" value={formatRegisteredDate(profile.registeredAt)} />
      </div>

      <DeveloperLeaderboard profile={profile} />

      {profile.notes && (
        <div className="border-b border-brand-border p-3">
          <div className="mb-2 text-[10px] uppercase text-brand-gray">// notes</div>
          <p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-white">
            {profile.notes}
          </p>
        </div>
      )}

      <div className="mt-auto border-t border-brand-border p-3">
        <div className="text-xs font-bold uppercase text-brand-primary">
          BREAK. TRACK. BUILD.
        </div>
        <div className="mt-2 text-xs uppercase text-white">
          DEVELOPER SESSION ACTIVE.
        </div>
        <button
          className="terminal-button mt-4 w-full justify-between border-brand-border text-brand-gray"
          onClick={onLogout}
          type="button"
        >
          <span>:session logout</span>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

export function Sidebar({
  developerProfile,
  onLogout,
}: {
  developerProfile: DeveloperProfile | null;
  onLogout: () => void;
}) {
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

  async function handleCopyInstaller(name: string, command: string | null) {
    if (!command) {
      return;
    }

    try {
      await navigator.clipboard.writeText(command);
      setCopiedInstaller(name);
    } catch {
      setCopiedInstaller(null);
    }
  }

  if (developerProfile) {
    return <DeveloperProfilePanel onLogout={onLogout} profile={developerProfile} />;
  }

  return (
    <aside className="terminal-pane flex min-h-[420px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        explorer
        <span className="ml-auto text-brand-gray">~/kit-code</span>
      </div>

      <div className="border-b border-brand-border p-3">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase text-white">
          <RadioTower size={14} className="text-brand-primary" />
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
            title={installer.command ?? installer.name}
            onClick={() => {
              void handleCopyInstaller(installer.name, installer.command);
            }}
          >
            <span className="tree-branch">{installer.branch}</span>
            <span
              className={copiedInstaller === installer.name ? 'tree-copy-status' : 'tree-label tree-command'}
            >
              {copiedInstaller === installer.name
                ? 'copied'
                : installer.command ?? installer.name}
            </span>
            <span className="tree-caret" aria-hidden="true">&lt;</span>
          </button>
        ))}
      </div>

      <div className="terminal-pane-title min-h-[30px]">
        symbol stream
        <span className="ml-auto text-brand-primary">recording</span>
      </div>

      <SymbolStream />

      <div className="border-t border-brand-border p-3">
        <div className="text-xs font-bold uppercase text-brand-primary">
          BREAK. TRACK. BUILD.
        </div>
        <div className="mt-2 text-xs uppercase text-white">
          EVERY SYMBOL COUNTS.
        </div>
      </div>
    </aside>
  );
}
