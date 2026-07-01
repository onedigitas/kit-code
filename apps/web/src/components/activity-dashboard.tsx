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
      <div className="font-title text-3xl leading-none text-brand-matcha">{value}</div>
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

function formatCompactDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}

function sourceLabel(summary: Summary) {
  const {git, vibe} = summary.global.sourceModes;

  if (git && vibe) return 'git + vibe';
  if (git) return 'git';
  if (vibe) return 'vibe';

  return 'none';
}

function shipMetric(summary: Summary) {
  const {git, vibe} = summary.global.sourceModes;

  if (git && !vibe) {
    return {
      title: 'TOTAL COMMITS',
      value: String(summary.global.totalCommits),
      subValue: 'git ship events',
    };
  }

  if (vibe && !git) {
    return {
      title: 'CHANGE BATCHES',
      value: String(summary.global.totalChangeBatches),
      subValue: 'vibe ship events',
    };
  }

  return {
    title: 'SHIP EVENTS',
    value: String(summary.global.totalCommits + summary.global.totalChangeBatches),
    subValue: 'git + vibe aggregate',
  };
}

function tierEqualsTarget(percent: 10 | 20 | 30) {
  return {
    10: 3,
    20: 6,
    30: 9,
  }[percent];
}

function milestoneTimeProgress(summary: Summary, percent: number) {
  const target = summary.reward.requiredSeconds * (percent / 100);
  const reached = Math.min(summary.reward.earnedSeconds, target);

  return `${formatCompactDuration(reached)}/${formatCompactDuration(target)}`;
}

function milestoneEqualsProgress(summary: Summary, percent: 10 | 20 | 30) {
  const target = tierEqualsTarget(percent);
  const reached = Math.min(summary.reward.totalEquals, target);

  return `${reached}/${target}`;
}

export function ActivityDashboard({ summary }: {
  summary: Summary;
}) {
  const rewardPercent = Math.round(summary.reward.progress * 100);
  const equalsPercent = Math.min(100, Math.round((summary.reward.totalEquals / summary.reward.requiredEquals) * 100));
  const shipping = shipMetric(summary);
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
      title: shipping.title,
      value: shipping.value,
      subValue: shipping.subValue,
    },
    {
      textIcon: '{}',
      title: 'ACTIVE FOLDERS',
      value: String(summary.global.trackingProjects),
      subValue: 'KitCode is on',
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
      icon: Gift,
      title: 'TARGET',
      value: formatDuration(summary.reward.requiredSeconds),
      subValue: `${summary.reward.requiredEquals} = needed`,
    },
  ];

  return (
    <section className="terminal-pane flex min-h-[760px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        dashboard.tsx
        <span className="ml-auto text-brand-gray">global dashboard</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border p-3">
        <button className="terminal-button border-brand-matcha text-brand-matcha">
          <Gift size={12} />
          NHẬN QUÀ
        </button>
        <div className="ml-auto flex min-h-8 items-center gap-2 border border-brand-border px-3 text-[10px] uppercase text-brand-gray">
          <span className="h-1.5 w-1.5 bg-[#10B981]"></span>
          SOURCE: {sourceLabel(summary)}
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
              <div className="mb-1 text-xs uppercase text-brand-gray">active folders</div>
              <div className="font-title text-4xl leading-none text-white">{summary.global.trackingProjects}</div>
            </div>
            <div className="terminal-card">
              <div className="mb-1 text-xs uppercase text-brand-gray">shipped =</div>
              <div className="font-title text-4xl leading-none text-white">{summary.global.totalEquals}</div>
            </div>
            <div className="terminal-card">
              <div className="mb-1 text-xs uppercase text-brand-gray">reward progress</div>
              <div className="font-title text-4xl leading-none text-brand-matcha">{rewardPercent}%</div>
            </div>
          </div>
        </div>

        <div className="terminal-pane flex min-h-[260px] flex-col overflow-hidden">
          <div className="terminal-pane-title min-h-[30px]">
            <Gift size={14} className="text-brand-gray" />
            break milestones
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-5 p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase text-brand-gray">active time</div>
                        <div className="font-title text-5xl leading-none text-brand-matcha">
                          {formatDuration(summary.reward.earnedSeconds)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-brand-gray">target</div>
                        <div className="font-title text-2xl leading-none text-white">
                          {formatDuration(summary.reward.requiredSeconds)}
                        </div>
                      </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden bg-brand-border">
                      <div className="h-full bg-brand-matcha" style={{ width: `${rewardPercent}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase text-brand-gray">shipped =</div>
                        <div className="font-title text-5xl leading-none text-brand-matcha">
                          {summary.reward.totalEquals}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-brand-gray">target</div>
                        <div className="font-title text-2xl leading-none text-white">
                          {summary.reward.requiredEquals}=
                        </div>
                      </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden bg-brand-border">
                      <div className="h-full bg-brand-matcha" style={{ width: `${equalsPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="terminal-card">
                <div className="text-[10px] uppercase text-brand-gray">next full break</div>
                <div className="mt-2 font-title text-3xl leading-none text-white">
                  {formatDuration(summary.reward.timeLeftSeconds)}
                </div>
                <div className="mt-2 text-[10px] uppercase text-brand-gray">
                  needs both time and shipped =
                </div>
              </div>
            </div>
            <div className="grid gap-3 text-xs lg:grid-cols-3">
              {summary.reward.tiers.map((tier) => (
                <div className="terminal-card" key={tier.percent}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase text-brand-gray">{tier.percent}% milestone</div>
                    <div className={tier.unlocked ? 'text-brand-matcha' : 'text-brand-gray'}>
                      {tier.unlocked ? 'PASSED' : 'LOCKED'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-brand-border p-2">
                      <div className="text-[10px] uppercase text-brand-gray">time</div>
                      <div className="mt-1 text-base font-bold text-white">
                        {milestoneTimeProgress(summary, tier.percent)}
                      </div>
                    </div>
                    <div className="border border-brand-border p-2">
                      <div className="text-[10px] uppercase text-brand-gray">=</div>
                      <div className="mt-1 text-base font-bold text-white">
                        {milestoneEqualsProgress(summary, tier.percent)}
                      </div>
                    </div>
                  </div>
                  {tier.unlocked && (
                    <div className="mt-3 border border-brand-matcha bg-brand-bg p-2">
                      <div className="text-[10px] uppercase text-brand-gray">voucher code</div>
                      <div className="mt-1 truncate text-sm font-bold text-brand-matcha">{tier.code}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
