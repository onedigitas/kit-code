import { Clock, Gift, GitCommit, Globe, LucideIcon } from 'lucide-react';
import { Summary } from '../lib/kitcode-api';

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

export function ActivityDashboard({ summary }: {
  summary: Summary;
}) {
  const rewardPercent = Math.round(summary.reward.progress * 100);
  const stats: StatCardProps[] = [
    {
      icon: Clock,
      title: 'GLOBAL ACTIVE',
      value: formatDuration(summary.global.totalActiveSeconds),
      subValue: 'developer-level total',
    },
    {
      textIcon: '||',
      title: 'GLOBAL IDLE',
      value: formatDuration(summary.global.totalIdleSeconds),
      subValue: 'after 5m inactivity',
    },
    {
      icon: GitCommit,
      title: 'TOTAL COMMITS',
      value: String(summary.global.totalCommits),
      subValue: 'aggregate count only',
    },
    {
      textIcon: '{}',
      title: 'REGISTERED PROJECTS',
      value: String(summary.global.totalProjects),
      subValue: `${summary.global.trackingProjects} tracking now`,
    },
    {
      textIcon: '=',
      title: 'SHIPPED =',
      value: String(summary.global.totalEquals),
      subValue: 'KitCode skill count',
    },
    {
      icon: Gift,
      title: 'REWARD LEFT',
      value: formatDuration(summary.reward.timeLeftSeconds),
      subValue: `${rewardPercent}% earned`,
    },
    {
      textIcon: '=',
      title: 'REWARD TARGET',
      value: formatDuration(summary.reward.requiredSeconds),
      subValue: 'global active time',
    },
  ];

  return (
    <section className="terminal-pane flex min-h-[760px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        dashboard.tsx
        <span className="ml-auto text-brand-gray">global dashboard</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border p-3">
        <button className="terminal-button border-brand-red text-brand-red">
          <Gift size={12} />
          NHẬN QUÀ
        </button>
        <div className="ml-auto flex min-h-8 items-center gap-2 border border-brand-border px-3 text-[10px] uppercase text-brand-gray">
          <span className="h-1.5 w-1.5 bg-[#10B981]"></span>
          CONNECTED
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 xl:grid-rows-[auto_auto_minmax(0,1fr)]">
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
            aggregate campaign pulse
          </div>
          <div className="grid gap-3 p-3 md:grid-cols-3">
            <div className="terminal-card">
              <div className="mb-1 text-xs uppercase text-brand-gray">registered projects</div>
              <div className="font-title text-4xl leading-none text-white">{summary.global.totalProjects}</div>
            </div>
            <div className="terminal-card">
              <div className="mb-1 text-xs uppercase text-brand-gray">shipped =</div>
              <div className="font-title text-4xl leading-none text-white">{summary.global.totalEquals}</div>
            </div>
            <div className="terminal-card">
              <div className="mb-1 text-xs uppercase text-brand-gray">reward progress</div>
              <div className="font-title text-4xl leading-none text-brand-red">{rewardPercent}%</div>
            </div>
          </div>
        </div>

        <div className="terminal-pane flex min-h-[260px] flex-col overflow-hidden">
          <div className="terminal-pane-title min-h-[30px]">
            <Gift size={14} className="text-brand-gray" />
            reward progress
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase text-brand-gray">earned active time</div>
                <div className="font-title text-5xl leading-none text-brand-red">
                  {formatDuration(summary.reward.earnedSeconds)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-brand-gray">target</div>
                <div className="font-title text-3xl leading-none text-white">
                  {formatDuration(summary.reward.requiredSeconds)}
                </div>
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden bg-brand-border">
              <div className="h-full bg-brand-red" style={{ width: `${rewardPercent}%` }}></div>
            </div>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="terminal-card">
                <div className="text-[10px] uppercase text-brand-gray">time left</div>
                <div className="mt-2 text-xl font-bold text-white">{formatDuration(summary.reward.timeLeftSeconds)}</div>
              </div>
              <div className="terminal-card">
                <div className="text-[10px] uppercase text-brand-gray">global commits</div>
                <div className="mt-2 text-xl font-bold text-white">{summary.global.totalCommits}</div>
              </div>
              <div className="terminal-card">
                <div className="text-[10px] uppercase text-brand-gray">idle time</div>
                <div className="mt-2 text-xl font-bold text-white">
                  {formatDuration(summary.global.totalIdleSeconds)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
