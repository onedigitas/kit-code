import { Clock, FileText, Gift, GitCommit, Globe, LucideIcon, Server } from 'lucide-react';
import { useKitCodeServer } from '../hooks/use-kitcode-server';

type StatCardProps = {
  icon?: LucideIcon;
  textIcon?: string;
  title: string;
  value: string;
  subValue?: string;
};

const StatCard = ({ icon: Icon, textIcon, title, value, subValue }: StatCardProps) => (
  <div className="terminal-card flex min-h-[112px] flex-col justify-between">
    <div className="flex items-start justify-between gap-3">
      <div className="text-[10px] uppercase leading-tight text-brand-gray">{title}</div>
      {textIcon ? (
        <div className="text-xs text-white">{textIcon}</div>
      ) : (
        Icon && <Icon size={16} className="shrink-0 text-white" />
      )}
    </div>
    <div>
      <div className="font-title text-3xl leading-none text-brand-red">{value}</div>
      {subValue && <div className="mt-1 text-[10px] text-brand-gray">{subValue}</div>}
    </div>
  </div>
);

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ActivityDashboard() {
  const { commits, isChecking, isConnected, lastCheckedAt, summary } = useKitCodeServer();
  const currentProject = summary?.currentProject;
  const rewardPercent = summary ? Math.round(summary.reward.progress * 100) : 0;
  const stats: StatCardProps[] = [
    {
      icon: Clock,
      title: 'PROJECT ACTIVE',
      value: currentProject ? formatDuration(currentProject.activeSeconds) : '0s',
      subValue: currentProject?.name ?? 'waiting for repo',
    },
    {
      textIcon: '</>',
      title: 'GLOBAL ACTIVE',
      value: summary ? formatDuration(summary.global.totalActiveSeconds) : '0s',
      subValue: `${summary?.global.totalProjects ?? 0} projects`,
    },
    {
      textIcon: '||',
      title: 'IDLE TIME',
      value: summary ? formatDuration(summary.global.totalIdleSeconds) : '0s',
      subValue: 'after 5m inactivity',
    },
    {
      icon: GitCommit,
      title: 'COMMITS',
      value: String(summary?.global.totalCommits ?? 0),
      subValue: currentProject ? `${currentProject.commitCount} in project` : 'metadata only',
    },
    {
      textIcon: '{}',
      title: 'PROJECTS',
      value: String(summary?.global.totalProjects ?? 0),
      subValue: 'global total',
    },
    {
      icon: Gift,
      title: 'REWARD LEFT',
      value: summary ? formatDuration(summary.reward.timeLeftSeconds) : '2h 0m',
      subValue: `${rewardPercent}% earned`,
    },
    {
      textIcon: '=',
      title: 'REWARD TARGET',
      value: summary ? formatDuration(summary.reward.requiredSeconds) : '2h 0m',
      subValue: 'active time',
    },
  ];

  return (
    <section className="terminal-pane flex min-h-[760px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        dashboard.tsx
        <span className="ml-auto text-brand-gray">
          {isConnected && currentProject ? `project: ${currentProject.name}` : 'session: offline'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border p-3">
        <button className="terminal-button border-brand-red text-brand-red">
          <Gift size={12} />
          NHẬN QUÀ
        </button>
        <div className="ml-auto flex min-h-8 items-center gap-2 border border-brand-border px-3 text-[10px] uppercase text-brand-gray">
          <span className={`h-1.5 w-1.5 ${isConnected ? 'bg-[#10B981]' : 'bg-brand-red'}`}></span>
          {isChecking ? 'CHECKING' : isConnected ? 'CONNECTED' : 'WAITING'}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 xl:grid-rows-[auto_auto_minmax(0,1fr)]">
        {!isConnected && (
          <div className="terminal-pane border-brand-red p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase text-white">
              <Server size={14} className="text-brand-red" />
              waiting for local kitcode server
            </div>
            <div className="text-[11px] text-brand-gray">run: npx kitcode serve</div>
            {lastCheckedAt && (
              <div className="mt-2 text-[10px] uppercase text-brand-gray">
                last check: {formatTime(lastCheckedAt.toISOString())}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-7">
          {stats.map((stat) => (
            <div key={stat.title}>
              <StatCard
                icon={stat.icon}
                textIcon={stat.textIcon}
                title={stat.title}
                value={stat.value}
                subValue={stat.subValue}
              />
            </div>
          ))}
        </div>

        <div className="terminal-pane overflow-hidden">
          <div className="terminal-pane-title min-h-[30px]">
            <Globe size={14} className="text-brand-gray" />
            project breakdown
          </div>
          <div className="grid gap-3 p-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="terminal-card">
              <div className="mb-1 text-xs text-white">{currentProject?.name ?? 'offline'}</div>
              <div className="mb-3 text-[10px] text-brand-gray">
                {currentProject ? `${currentProject.commitCount} commits` : 'no local server'}
              </div>
              <div className="h-1 w-full overflow-hidden bg-brand-border">
                <div className="h-full bg-brand-red" style={{ width: `${rewardPercent}%` }}></div>
              </div>
            </div>
            <div className="terminal-card flex items-center justify-between gap-3 text-[11px] text-brand-gray">
              <span className="text-white">:source localhost:4747</span>
              <span>{isConnected ? 'stats + commits only' : 'waiting for npx kitcode serve'}</span>
            </div>
          </div>
        </div>

        <div className="terminal-pane flex min-h-[300px] flex-col overflow-hidden">
          <div className="terminal-pane-title min-h-[30px]">
            <FileText size={14} className="text-brand-gray" />
            quickfix: recent commits
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="quickfix-table w-full text-left text-xs">
              <thead className="sticky top-0 bg-brand-panel">
                <tr className="text-[10px] uppercase text-brand-gray">
                  <th className="px-3 py-3 font-normal">ln</th>
                  <th className="px-3 py-3 font-normal">time</th>
                  <th className="px-3 py-3 font-normal">hash</th>
                  <th className="px-3 py-3 font-normal">message</th>
                </tr>
              </thead>
              <tbody>
                {commits.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-brand-gray">1</td>
                    <td className="px-3 py-3 text-brand-gray">--</td>
                    <td className="px-3 py-3 text-brand-red">WAIT</td>
                    <td className="px-3 py-3 text-brand-gray">run npx kitcode serve in a git repo</td>
                  </tr>
                )}
                {commits.map((commit, index) => (
                  <tr key={commit.hash}>
                    <td className="px-3 py-3 text-brand-gray">{index + 1}</td>
                    <td className="px-3 py-3 text-brand-gray">{formatTime(commit.committedAt)}</td>
                    <td className="px-3 py-3 text-brand-red">{commit.shortHash}</td>
                    <td className="px-3 py-3 text-brand-gray">
                      {commit.message}
                      <span className="ml-2 text-[10px] text-brand-gray">{commit.authorName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
