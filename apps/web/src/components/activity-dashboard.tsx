import { useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Clock, Copy, Eye, Gift, LockKeyhole } from 'lucide-react';
import { Summary } from '../lib/kitcode-api';
import {
  formatDuration,
  getProgressSummary,
  milestoneStateLabel,
  PROGRESS_MILESTONES,
  type MilestoneClaimState,
  type MilestoneSummary,
  type ProgressMilestone,
  type ProgressSummary,
  rewardMetadata,
  sourceLabel,
} from '../lib/reward-progress';
import { MetricCard, MetricCardProps, TopMetricCard } from './reward-metric-card';

function milestoneStateIcon(state: MilestoneClaimState) {
  if (state === 'claimed') return Check;
  if (state === 'ready') return Gift;

  return LockKeyhole;
}

function BreakTimeline({ progress }: { progress: ProgressSummary }) {
  const currentMilestoneLabel = progress.milestones.find(({state}) => state === 'locked')?.milestone.label;

  return (
    <section className="reward-panel flex h-full flex-col px-4 py-5 sm:px-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase text-white">Break Progress</h2>
        <div className="flex gap-3 text-[11px] uppercase text-brand-gray">
          <span>Time {progress.timePercent}%</span>
          <span>Equal presses {progress.equalsPercent}%</span>
        </div>
      </div>

      <div className="-mx-1 min-h-0 flex-1 overflow-x-auto px-1 pb-6">
        <div className="relative min-w-[720px] px-6 pb-24 pt-12">
          <div className="absolute left-6 right-6 top-12 h-[3px] bg-[repeating-linear-gradient(90deg,#4b555a_0_16px,transparent_16px_28px)]" />
          <div className="absolute left-6 right-6 top-12 h-[3px] overflow-hidden">
            <div
              className="h-full shadow-[0_0_24px_rgba(139,195,74,0.5)] transition-[width]"
              style={{
                background: '#8BC34A',
                width: `${progress.breakProgress}%`,
              }}
            />
          </div>

          {progress.milestones.map(({milestone, state, timeProgress}) => {
            const markerEdgeClass = milestone.label === 100 ? '-translate-x-full' : '-translate-x-1/2';
            const isUnlocked = state !== 'locked';
            const isCurrent = milestone.label === currentMilestoneLabel;
            const metadata = rewardMetadata(milestone);
            const accent = metadata.style === 'kitkat'
              ? '#ff3440'
              : metadata.style === 'gold'
                ? '#ffd84a'
                : '#8BC34A';

            return (
              <div
                key={milestone.label}
                className={[
                  'absolute top-12 z-10 flex min-w-24 flex-col items-center transition-colors',
                  markerEdgeClass,
                ].join(' ')}
                style={{left: `${milestone.label}%`, color: isUnlocked || isCurrent ? accent : '#8a9498'}}
              >
                <div
                  className={[
                    'grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border-2 bg-[#071014]',
                    isCurrent ? 'outline outline-2 outline-offset-4' : '',
                  ].join(' ')}
                  style={{
                    borderColor: isUnlocked || isCurrent ? accent : '#8a9498',
                    boxShadow: isUnlocked || isCurrent ? `0 0 18px ${accent}` : undefined,
                    outlineColor: isCurrent ? accent : undefined,
                  }}
                >
                  {isUnlocked ? (
                    <Check size={17} strokeWidth={3} />
                  ) : milestone.label === 100 ? (
                    <Gift size={15} />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  )}
                </div>
                <div className="mt-3 font-title text-3xl leading-none">{milestone.label}%</div>
                {!isUnlocked && (
                  <div className="mt-1 text-center text-[10px] font-bold uppercase">
                    {isCurrent ? 'Current Break' : milestone.label === 100 ? 'Legendary Break' : 'Locked'}
                  </div>
                )}
                <div className="mt-2 text-[11px] text-brand-gray">{isUnlocked || isCurrent ? timeProgress : '--:--:--'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative mx-auto grid aspect-square h-[252px] place-items-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 252 252" aria-hidden="true">
        <circle
          cx="126"
          cy="126"
          fill="none"
          r={radius}
          stroke="rgba(166,166,166,0.16)"
          strokeWidth="9"
        />
        <circle
          className="drop-shadow-[0_0_12px_rgba(139,195,74,0.85)]"
          cx="126"
          cy="126"
          fill="none"
          r={radius}
          stroke="var(--color-brand-matcha)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="9"
        />
      </svg>
      <div className="text-center">
        <div className="font-title text-6xl leading-none text-white">{percent}%</div>
        <div className="mt-1 text-[10px] uppercase text-brand-gray">Break Progress</div>
      </div>
    </div>
  );
}

function YourProgressPanel({ progress, summary }: { progress: ProgressSummary; summary: Summary }) {
  return (
    <section className="reward-panel flex h-full flex-col p-4 sm:p-5">
      <h2 className="mb-2 text-sm font-bold uppercase text-white">Your Progress</h2>
      <div className="grid flex-1 content-start gap-3">
        <div className="grid gap-3">
          <MetricCard
            textIcon="="
            title="Equal ( = ) Pressed"
            value={String(summary.global.totalEquals)}
          />
          <MetricCard
            icon={Clock}
            title="Focus Time"
            value={formatDuration(summary.global.totalActiveSeconds)}
          />
        </div>
        <ProgressRing percent={progress.breakProgress} />
      </div>
    </section>
  );
}

function RewardCard({
  equalsProgress,
  equalsPercent,
  equalsReached,
  isRedeeming,
  isSelected,
  milestone,
  onClaim,
  onSelect,
  state,
  timePercent,
  timeProgress,
  timeReached,
}: {
  equalsProgress: string;
  equalsPercent: number;
  equalsReached: boolean;
  isRedeeming: boolean;
  isSelected: boolean;
  milestone: ProgressMilestone;
  onClaim: (milestone: ProgressMilestone) => void;
  onSelect: (milestone: ProgressMilestone) => void;
  state: MilestoneClaimState;
  timePercent: number;
  timeProgress: string;
  timeReached: boolean;
}) {
  const StatusIcon = milestoneStateIcon(state);
  const isReady = state === 'ready';
  const isClaimed = state === 'claimed';
  const isLocked = state === 'locked';
  const isMediumStake = milestone.label === 50;
  const metadata = rewardMetadata(milestone);
  const accentClass = metadata.style === 'gold'
    ? 'reward-card-gold'
    : metadata.style === 'kitkat'
      ? 'reward-card-kitkat'
      : '';

  return (
    <article
      aria-pressed={isSelected}
      className={[
        'reward-card flex min-h-[170px] cursor-pointer flex-col justify-between p-4 transition-colors',
        accentClass,
        isSelected ? 'reward-card-selected' : '',
        isReady
          ? 'reward-card-ready border-brand-matcha'
          : isClaimed
            ? 'reward-card-claimed border-brand-matcha'
            : 'opacity-72',
      ].join(' ')}
      onClick={() => onSelect(milestone)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(milestone);
        }
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className={isLocked ? 'font-title text-4xl leading-none text-brand-gray' : 'font-title text-4xl leading-none text-brand-matcha'}>
            {milestone.label}%
          </div>
          {metadata.tag && (
            <div className="border border-current px-2 py-0.5 text-[9px] font-bold uppercase opacity-80">
              {metadata.tag}
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-2">
          <RewardProgressBar
            icon={<Clock size={13} />}
            isReached={timeReached}
            percent={timePercent}
            value={timeProgress}
          />
          <RewardProgressBar
            icon={<span className="font-bold">=</span>}
            isReached={equalsReached}
            percent={equalsPercent}
            value={equalsProgress}
          />
        </div>
      </div>

      {isReady ? (
        <button
          className="terminal-button claim-now-button mt-4 min-h-10 font-bold"
          disabled={!isMediumStake && isRedeeming}
          onClick={(event) => {
            event.stopPropagation();
            onClaim(milestone);
          }}
          type="button"
        >
          {isMediumStake ? 'Registration Form' : isRedeeming ? 'Claiming' : 'Claim Now'}
        </button>
      ) : (
        <div
          className={[
            'mt-4 inline-flex min-h-10 items-center justify-center gap-2 border px-3 text-[11px] font-bold uppercase',
            isClaimed
              ? 'border-brand-matcha bg-[rgba(139,195,74,0.22)] text-white shadow-[0_0_16px_rgba(139,195,74,0.24)]'
              : 'border-brand-border text-brand-gray',
          ].join(' ')}
        >
          <StatusIcon size={14} />
          <span>{isClaimed ? 'Claimed' : 'In Progress'}</span>
        </div>
      )}
    </article>
  );
}

function RewardProgressBar({
  icon,
  isReached,
  percent,
  value,
}: {
  icon: ReactNode;
  isReached: boolean;
  percent: number;
  value: string;
}) {
  return (
    <div className="reward-progress">
      <div className="reward-progress-meta">
        <span className={`inline-flex h-4 w-4 items-center justify-center ${isReached ? 'text-brand-matcha' : 'text-brand-gray'}`}>
          {icon}
        </span>
        <span className={isReached ? 'text-brand-matcha' : 'text-white'}>{value}</span>
      </div>
      <div className="reward-progress-track">
        <div className="reward-progress-fill" style={{width: `${percent}%`}} />
      </div>
    </div>
  );
}

function RewardsPanel({
  isRedeeming,
  onClaim,
  onSelect,
  progress,
  selectedMilestone,
}: {
  isRedeeming: boolean;
  onClaim: (milestone: ProgressMilestone) => void;
  onSelect: (milestone: ProgressMilestone) => void;
  progress: ProgressSummary;
  selectedMilestone: ProgressMilestone;
}) {
  return (
    <section className="reward-panel flex h-full flex-col p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-bold uppercase text-white">Available Rewards</h2>
      <div className="grid grid-cols-3 gap-3">
        {progress.milestones.slice(0, 3).map(({equalsProgress, equalsPercent, equalsReached, milestone, state, timePercent, timeProgress, timeReached}) => (
          <div key={milestone.label}>
            <RewardCard
              equalsProgress={equalsProgress}
              equalsPercent={equalsPercent}
              equalsReached={equalsReached}
              isRedeeming={isRedeeming}
              isSelected={selectedMilestone.label === milestone.label}
              milestone={milestone}
              onClaim={onClaim}
              onSelect={onSelect}
              state={state}
              timePercent={timePercent}
              timeProgress={timeProgress}
              timeReached={timeReached}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {progress.milestones.slice(3).map(({equalsProgress, equalsPercent, equalsReached, milestone, state, timePercent, timeProgress, timeReached}) => (
          <div key={milestone.label}>
            <RewardCard
              equalsProgress={equalsProgress}
              equalsPercent={equalsPercent}
              equalsReached={equalsReached}
              isRedeeming={isRedeeming}
              isSelected={selectedMilestone.label === milestone.label}
              milestone={milestone}
              onClaim={onClaim}
              onSelect={onSelect}
              state={state}
              timePercent={timePercent}
              timeProgress={timeProgress}
              timeReached={timeReached}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function RewardPreviewPanel({ selectedReward }: { selectedReward: MilestoneSummary }) {
  const metadata = rewardMetadata(selectedReward.milestone);
  const isLocked = selectedReward.state === 'locked';
  const [hasCopiedVoucher, setHasCopiedVoucher] = useState(false);

  async function handleCopyVoucher() {
    try {
      await navigator.clipboard.writeText(selectedReward.rewardCode);
      setHasCopiedVoucher(true);
      window.setTimeout(() => setHasCopiedVoucher(false), 1400);
    } catch {
      setHasCopiedVoucher(false);
    }
  }

  return (
    <section className={`reward-panel reward-preview-panel reward-preview-panel-${metadata.style} flex h-full flex-col overflow-hidden p-4 sm:p-5`}>
      <div className="relative z-10 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase text-white">Reward Unlock Preview</h2>
        <span className="font-title text-3xl leading-none text-brand-matcha">{selectedReward.milestone.label}%</span>
      </div>
      <div className="relative grid min-h-[300px] flex-1 place-items-center overflow-hidden py-2">
        <img
          alt={metadata.imageAlt}
          className="relative z-10 w-[360px] max-w-[112%]"
          src={metadata.imageSrc}
        />
      </div>
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          {metadata.tag && (
            <span className="border border-current px-2 py-0.5 text-[9px] font-bold uppercase text-brand-matcha">
              {metadata.tag}
            </span>
          )}
          <span className="text-[10px] uppercase text-brand-gray">
            {milestoneStateLabel(selectedReward.state)}
          </span>
        </div>
        <h3 className="text-sm font-bold uppercase text-white">
          {metadata.name}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-brand-gray">
          {metadata.description}
        </p>
        {isLocked ? (
          <div className="mt-4 grid gap-2">
            <div className="text-[10px] uppercase text-brand-gray">Unlock Requirements</div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3 border border-brand-border bg-[#050505] px-3 py-2 text-[11px]">
                <span className={`inline-flex items-center gap-1 ${selectedReward.timeReached ? 'text-brand-matcha' : 'text-brand-gray'}`}>
                  <Clock size={13} />
                  Focus
                </span>
                <span className={selectedReward.timeReached ? 'text-brand-matcha' : 'text-white'}>
                  {selectedReward.timeProgress}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border border-brand-border bg-[#050505] px-3 py-2 text-[11px]">
                <span className={`inline-flex items-center gap-1 ${selectedReward.equalsReached ? 'text-brand-matcha' : 'text-brand-gray'}`}>
                  <span className="font-bold">=</span>
                  Equals
                </span>
                <span className={selectedReward.equalsReached ? 'text-brand-matcha' : 'text-white'}>
                  {selectedReward.equalsProgress}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="text-[10px] uppercase text-brand-gray">Voucher Code</div>
            <div className="voucher-ticket mt-2">
              <div className="voucher-ticket-main">
                <div className="voucher-ticket-label">Your Voucher Code</div>
                <pre className="voucher-ticket-code">
                  <code>{selectedReward.rewardCode}</code>
                </pre>
              </div>
              <button
                aria-label="Copy voucher code"
                className="voucher-copy-button"
                onClick={handleCopyVoucher}
                type="button"
              >
                <Copy size={18} />
                <span>{hasCopiedVoucher ? 'Copied' : 'Copy'}</span>
              </button>
              <div className="voucher-ticket-meta">
                <span>Usage</span>
                <span>One-time use only</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ActivityDashboard({ onStartMediumStake, summary, onRedeem }: {
  onStartMediumStake: () => void;
  summary: Summary;
  onRedeem: () => Promise<void>;
}) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedMilestoneLabel, setSelectedMilestoneLabel] = useState<ProgressMilestone['label']>(10);
  const progress = getProgressSummary(summary);
  const selectedReward = progress.milestones.find(({milestone}) => milestone.label === selectedMilestoneLabel)
    ?? progress.milestones[0];
  const selectedMilestone = selectedReward.milestone;
  const targetMilestone = PROGRESS_MILESTONES[PROGRESS_MILESTONES.length - 1];
  const readyVoucherCount = progress.milestones.filter(({state}) => state === 'ready').length;
  const canRedeem = readyVoucherCount > 0 && !isRedeeming;
  const topMetrics: MetricCardProps[] = [
    {
      icon: Gift,
      title: 'Break Target',
      value: formatDuration(targetMilestone.minSeconds),
      subValue: `${targetMilestone.minEquals} equal (=) presses needed`,
    },
    {
      icon: Check,
      title: 'Total Projects',
      value: String(summary.global.totalProjects),
      subValue: 'folders saved in local state',
    },
    {
      icon: Gift,
      title: 'Available Rewards',
      value: String(readyVoucherCount),
      subValue: 'rewards ready to claim',
    },
    {
      icon: Eye,
      title: 'Source Mode',
      value: sourceLabel(summary),
      subValue: 'how activity is detected',
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

  function handleClaim(milestone: ProgressMilestone) {
    if (milestone.label === 50) {
      onStartMediumStake();
      return;
    }

    void handleRedeem();
  }

  return (
    <section className="terminal-pane flex min-h-[760px] flex-col overflow-hidden lg:min-h-0" data-active="true">
      <div className="reward-dashboard flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex min-h-full min-w-[1320px] flex-1 flex-col">
        <header className="grid grid-cols-[minmax(280px,1fr)_760px] gap-8 border-b border-brand-border p-4 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <Gift size={18} className="mt-1 shrink-0 text-brand-matcha" />
            <div className="min-w-0">
              <h1 className="text-base font-bold uppercase text-white">Reward Code System</h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-brand-gray">
                Earn break rewards as you maintain focus and build consistently.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(4,minmax(178px,1fr))] gap-3">
            {topMetrics.map((metric) => (
              <div key={metric.title}>
                <TopMetricCard
                  icon={metric.icon}
                  subValue={metric.subValue}
                  title={metric.title}
                  value={metric.value}
                />
              </div>
            ))}
          </div>
        </header>

        <div className="grid flex-1 grid-cols-[minmax(430px,0.98fr)_minmax(570px,1.25fr)_minmax(280px,0.68fr)] grid-rows-[auto_minmax(0,1fr)] items-stretch gap-3 p-3">
          <div className="row-span-2">
            <YourProgressPanel progress={progress} summary={summary} />
          </div>
          <div className="col-span-2">
            <BreakTimeline progress={progress} />
          </div>
          <RewardsPanel
            isRedeeming={isRedeeming}
            onClaim={handleClaim}
            onSelect={(milestone) => setSelectedMilestoneLabel(milestone.label)}
            progress={progress}
            selectedMilestone={selectedMilestone}
          />
          <RewardPreviewPanel selectedReward={selectedReward} />
        </div>
        </div>
      </div>
    </section>
  );
}
