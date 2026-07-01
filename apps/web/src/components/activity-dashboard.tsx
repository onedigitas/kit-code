import { useState } from 'react';
import { Check, Clock, Gift, GitCommit, LockKeyhole, LucideIcon } from 'lucide-react';
import { Summary } from '../lib/kitcode-api';

const PROGRESS_MILESTONES = [
  {label: 10, threshold: 10, minSeconds: 1, minEquals: 3, code: 'if(tired){return 10;}'},
  {label: 20, threshold: 20, minSeconds: 2, minEquals: 6, code: 'takeBreak(20);'},
  {label: 30, threshold: 30, minSeconds: 3, minEquals: 9, code: 'while(working)break(30);'},
  {label: 50, threshold: 1000, minSeconds: 10, minEquals: 10, code: 'mediumStake.unlock(50);'},
  {label: 100, threshold: 5000, minSeconds: 50, minEquals: 50, code: 'finalBreak.claim(100);'},
] as const;

type ProgressMilestone = (typeof PROGRESS_MILESTONES)[number];

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
  const remainingSeconds = seconds % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
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

function effortToProgress(effort: number) {
  const normalizedEffort = Math.max(0, effort);

  for (let index = 0; index < PROGRESS_MILESTONES.length; index += 1) {
    const milestone = PROGRESS_MILESTONES[index];
    const previousMilestone = PROGRESS_MILESTONES[index - 1];
    const startThreshold = previousMilestone?.threshold ?? 0;
    const startLabel = previousMilestone?.label ?? 0;

    if (normalizedEffort <= milestone.threshold) {
      const thresholdRange = milestone.threshold - startThreshold;
      const labelRange = milestone.label - startLabel;
      const rangeProgress = thresholdRange === 0 ? 1 : (normalizedEffort - startThreshold) / thresholdRange;

      return Math.min(100, Math.max(0, startLabel + (rangeProgress * labelRange)));
    }
  }

  return 100;
}

function milestoneTimeTarget(summary: Summary, milestone: ProgressMilestone) {
  return Math.max(milestone.minSeconds, Math.ceil(summary.reward.requiredSeconds * (milestone.threshold / 100)));
}

function milestoneTimeProgress(summary: Summary, milestone: ProgressMilestone) {
  const target = milestoneTimeTarget(summary, milestone);
  const reached = Math.min(summary.reward.earnedSeconds, target);

  return `${formatCompactDuration(reached)}/${formatCompactDuration(target)}`;
}

function milestoneEqualsTarget(summary: Summary, milestone: ProgressMilestone) {
  return Math.max(milestone.minEquals, Math.ceil(summary.reward.requiredEquals * (milestone.threshold / 100)));
}

function milestoneEqualsProgress(summary: Summary, milestone: ProgressMilestone) {
  const target = milestoneEqualsTarget(summary, milestone);
  const reached = Math.min(summary.reward.totalEquals, target);

  return `${reached}/${target}`;
}

function milestoneTimeReached(summary: Summary, milestone: ProgressMilestone) {
  return summary.reward.earnedSeconds >= milestoneTimeTarget(summary, milestone);
}

function milestoneEqualsReached(summary: Summary, milestone: ProgressMilestone) {
  return summary.reward.totalEquals >= milestoneEqualsTarget(summary, milestone);
}

type MilestoneClaimState = 'claimed' | 'ready' | 'locked';

function milestoneClaimState(
  tier: Summary['reward']['tiers'][number] | undefined,
  passed: boolean,
): MilestoneClaimState {
  if (tier?.redeemed) return 'claimed';
  if (passed) return 'ready';

  return 'locked';
}

function milestoneStateLabel(state: MilestoneClaimState) {
  if (state === 'claimed') return 'claimed';
  if (state === 'ready') return 'claim';

  return 'locked';
}

function milestoneStateIcon(state: MilestoneClaimState) {
  if (state === 'claimed') return Check;
  if (state === 'ready') return Gift;

  return LockKeyhole;
}

function CampaignStakeProgress({
  onStartMediumStake,
  summary,
}: {
  onStartMediumStake: () => void;
  summary: Summary;
}) {
  const timeEffort = Math.max(0, (summary.reward.earnedSeconds / summary.reward.requiredSeconds) * 100);
  const equalsEffort = Math.max(0, (summary.reward.totalEquals / summary.reward.requiredEquals) * 100);
  const timePercent = Math.min(100, Math.round(effortToProgress(timeEffort)));
  const equalsPercent = Math.min(100, Math.round(effortToProgress(equalsEffort)));
  const breakProgress = Math.round(effortToProgress(Math.min(timeEffort, equalsEffort)));
  const milestoneSummaries = PROGRESS_MILESTONES.map((milestone) => {
    const timeReached = milestoneTimeReached(summary, milestone);
    const equalsReached = milestoneEqualsReached(summary, milestone);
    const passed = timeReached && equalsReached;
    const unlockedTier = summary.reward.tiers.find((tier) => tier.percent === milestone.label);
    const state = milestoneClaimState(unlockedTier, passed);

    return {
      milestone,
      timeReached,
      equalsReached,
      passed,
      state,
      rewardCode: unlockedTier?.code ?? milestone.code,
    };
  });
  const nextMilestone = milestoneSummaries.find(({state}) => state !== 'claimed')
    ?? milestoneSummaries[milestoneSummaries.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase text-brand-gray">
        <div>Break progress {breakProgress}%</div>
        <div className="flex gap-3">
          <span>Time {timePercent}%</span>
          <span>Shipped {equalsPercent}%</span>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div className="relative min-w-[640px] pb-16 pt-7">
          <div className="relative h-3 w-full border border-brand-border bg-[#050505]">
            <div
              className="h-full bg-brand-matcha transition-[width]"
              style={{width: `${breakProgress}%`}}
            />
            {milestoneSummaries.map(({milestone, passed, state}) => {
              const StatusIcon = milestoneStateIcon(state);
              const isStakeAction = milestone.label === 50;
              const markerEdgeClass = milestone.label === 100 ? '-translate-x-full' : '-translate-x-1/2';
              const labelEdgeClass = milestone.label === 100 ? '-translate-x-full items-end text-right' : '-translate-x-1/2 items-center text-center';
              const markerClass = [
                'absolute top-1/2 z-10 flex h-10 min-w-13 -translate-y-1/2 items-center justify-center gap-1 border px-2 font-title text-xl leading-none transition-colors',
                markerEdgeClass,
                state === 'claimed'
                  ? 'border-brand-matcha bg-brand-matcha text-black'
                  : state === 'ready'
                    ? 'border-brand-matcha bg-[#142006] text-brand-matcha shadow-[0_0_16px_rgba(139,195,74,0.22)]'
                    : 'border-brand-border bg-brand-bg text-brand-gray',
              ].join(' ');

              return (
                <div key={milestone.label}>
                  {isStakeAction ? (
                    <button
                      aria-label="Start Medium Stake"
                      className={`${markerClass} ${passed ? 'cursor-pointer hover:bg-brand-matcha hover:text-black' : 'cursor-not-allowed'}`}
                      disabled={!passed}
                      onClick={passed ? onStartMediumStake : undefined}
                      title="Start Medium Stake"
                      type="button"
                      style={{left: `${milestone.label}%`}}
                    >
                      <Gift size={14} />
                      <span>{milestone.label}%</span>
                    </button>
                  ) : (
                    <div
                      className={markerClass}
                      style={{left: `${milestone.label}%`}}
                    >
                      <span>{milestone.label}%</span>
                    </div>
                  )}
                  <div
                    className={`absolute top-9 flex min-w-[76px] flex-col gap-1 ${labelEdgeClass}`}
                    style={{left: `${milestone.label}%`}}
                  >
                    <div
                      className={[
                        'inline-flex items-center gap-1 text-[10px] uppercase',
                        state === 'claimed'
                          ? 'text-brand-matcha'
                          : state === 'ready'
                            ? 'text-white'
                            : 'text-brand-gray',
                      ].join(' ')}
                    >
                      <StatusIcon size={12} />
                      <span>{milestoneStateLabel(state)}</span>
                    </div>
                    {isStakeAction && passed && (
                      <span className="whitespace-nowrap text-[10px] uppercase text-brand-matcha">
                        Medium Stake
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 text-xs lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="border border-brand-border bg-[#080808] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase text-brand-gray">next target</div>
            <div className="font-title text-2xl leading-none text-brand-matcha">
              {nextMilestone.milestone.label}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className={nextMilestone.timeReached ? 'border border-brand-matcha p-2 text-brand-matcha' : 'border border-brand-border p-2 text-brand-gray'}>
              <div className="text-[10px] uppercase">focus time</div>
              <div className="mt-1 text-base font-bold">{milestoneTimeProgress(summary, nextMilestone.milestone)}</div>
            </div>
            <div className={nextMilestone.equalsReached ? 'border border-brand-matcha p-2 text-brand-matcha' : 'border border-brand-border p-2 text-brand-gray'}>
              <div className="text-[10px] uppercase">shipped =</div>
              <div className="mt-1 text-base font-bold">{milestoneEqualsProgress(summary, nextMilestone.milestone)}</div>
            </div>
          </div>
        </div>

        <div className="border border-brand-border bg-[#080808] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase text-brand-gray">reward codes</div>
            <div className="text-[10px] uppercase text-brand-gray">unlocked codes only</div>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {milestoneSummaries.map(({milestone, rewardCode, state}) => {
              const StatusIcon = milestoneStateIcon(state);
              const isLocked = state === 'locked';

              return (
                <div
                  className={[
                    'flex min-w-0 items-center gap-2 border p-2',
                    isLocked
                      ? 'border-brand-border text-brand-gray'
                      : 'border-brand-matcha bg-[rgba(139,195,74,0.08)] text-brand-matcha',
                  ].join(' ')}
                  key={milestone.label}
                >
                  <div className="font-title text-xl leading-none">{milestone.label}%</div>
                  <StatusIcon size={12} className="shrink-0" />
                  <div className="min-w-0 truncate text-[11px] font-bold">
                    {isLocked ? 'locked' : rewardCode}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityDashboard({ onStartMediumStake, summary, onRedeem }: {
  onStartMediumStake: () => void;
  summary: Summary;
  onRedeem: () => Promise<void>;
}) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const rewardPercent = Math.round(summary.reward.progress * 100);
  const shipping = shipMetric(summary);
  const readyVoucherCount = summary.reward.tiers.filter((tier) => tier.status === 'ready').length;
  const canRedeem = readyVoucherCount > 0 && !isRedeeming;
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
      title: 'BREAK LEFT',
      value: formatDuration(summary.reward.timeLeftSeconds),
      subValue: `${rewardPercent}% earned`,
    },
    {
      icon: Gift,
      title: 'BREAK TARGET',
      value: formatDuration(summary.reward.requiredSeconds),
      subValue: `${summary.reward.requiredEquals} = needed`,
    },
  ];

  async function handleRedeem() {
    if (!canRedeem) {
      return;
    }

    setIsRedeeming(true);

    try {
      await onRedeem();
    } finally {
      setIsRedeeming(false);
    }
  }

  return (
    <section className="terminal-pane flex min-h-[760px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="terminal-pane-title">
        dashboard.tsx
        <span className="ml-auto text-brand-gray">global dashboard</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border p-3">
        <button
          className={`terminal-button border-brand-matcha text-brand-matcha ${canRedeem ? '' : 'cursor-not-allowed opacity-50'}`}
          disabled={!canRedeem}
          onClick={handleRedeem}
          type="button"
        >
          <Gift size={12} />
          {isRedeeming ? 'ĐANG NHẬN' : readyVoucherCount > 0 ? `NHẬN QUÀ (${readyVoucherCount})` : 'NHẬN QUÀ'}
        </button>
        <div className="ml-auto flex min-h-8 items-center gap-2 border border-brand-border px-3 text-[10px] uppercase text-brand-gray">
          <span className="h-1.5 w-1.5 bg-[#10B981]"></span>
          SOURCE: {sourceLabel(summary)}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 xl:grid-rows-[auto_minmax(0,1fr)]">
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

        <div className="terminal-pane flex min-h-[260px] flex-col overflow-hidden">
          <div className="terminal-pane-title min-h-[30px]">
            <Gift size={14} className="text-brand-gray" />
            break milestones
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-5 p-5">
            <CampaignStakeProgress
              onStartMediumStake={onStartMediumStake}
              summary={summary}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
