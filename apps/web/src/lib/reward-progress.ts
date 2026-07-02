import type { Summary } from './kitcode-api';

export const PROGRESS_MILESTONES = [
  {label: 10, threshold: 10, minSeconds: 10, minEquals: 3, code: 'if(tired){return 10;}'},
  {label: 20, threshold: 20, minSeconds: 20, minEquals: 6, code: 'takeBreak(20);'},
  {label: 30, threshold: 30, minSeconds: 30, minEquals: 9, code: 'while(working){break(30);}'},
  {label: 50, threshold: 50, minSeconds: 50, minEquals: 12, code: 'mediumStake.unlock(50);'},
  {label: 100, threshold: 100, minSeconds: 100, minEquals: 15, code: 'finalBreak.claim(100);'},
] as const;

export type ProgressMilestone = (typeof PROGRESS_MILESTONES)[number];
type RewardTier = Summary['reward']['tiers'][number];
export type MilestoneClaimState = 'claimed' | 'ready' | 'locked';
type RewardStyle = 'green' | 'kitkat' | 'gold';

type RewardMetadata = {
  description: string;
  imageAlt: string;
  imageSrc: string;
  name: string;
  style: RewardStyle;
  tag?: string;
};

export type MilestoneSummary = {
  milestone: ProgressMilestone;
  rewardCode: string;
  state: MilestoneClaimState;
  timeReached: boolean;
  equalsReached: boolean;
  timeProgress: string;
  equalsProgress: string;
  timePercent: number;
  equalsPercent: number;
};

export type ProgressSummary = {
  breakProgress: number;
  timePercent: number;
  equalsPercent: number;
  milestones: MilestoneSummary[];
};

const REWARD_METADATA: Record<ProgressMilestone['label'], RewardMetadata> = {
  10: {
    description: 'Get started on the right track.',
    imageAlt: 'Green neon Focus Starter gift box',
    imageSrc: '/reward-green-pack.png',
    name: 'Focus Starter',
    style: 'green',
  },
  20: {
    description: 'Keep your momentum going.',
    imageAlt: 'Green neon Momentum Boost gift box',
    imageSrc: '/reward-green-pack.png',
    name: 'Momentum Boost',
    style: 'green',
  },
  30: {
    description: "You're doing great!",
    imageAlt: 'Green neon Progress Pack gift box',
    imageSrc: '/reward-green-pack.png',
    name: 'Progress Pack',
    style: 'green',
  },
  50: {
    description: 'Exclusive items to level up.',
    imageAlt: 'KitKat red neon Vibe Pack gift box',
    imageSrc: '/reward-kitkat-pack.png',
    name: 'Vibe Pack',
    style: 'kitkat',
    tag: 'Special',
  },
  100: {
    description: 'The ultimate reward for legends.',
    imageAlt: 'Golden neon Legendary Pack reward chest',
    imageSrc: '/reward-legendary-chest.png',
    name: 'Legendary Pack',
    style: 'gold',
    tag: 'Legendary',
  },
};

export function rewardMetadata(milestone: ProgressMilestone) {
  return REWARD_METADATA[milestone.label];
}

export function formatDuration(totalSeconds: number) {
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

export function sourceLabel(summary: Summary) {
  const {git, vibe} = summary.global.sourceModes;

  if (git && vibe) return 'git + vibe';
  if (git) return 'git';
  if (vibe) return 'vibe';

  return 'none';
}

function safePercent(current: number, target: number) {
  if (target <= 0) return current > 0 ? 100 : 0;

  return (current / target) * 100;
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

function milestoneTimeTarget(milestone: ProgressMilestone) {
  return milestone.minSeconds;
}

function milestoneEqualsTarget(milestone: ProgressMilestone) {
  return milestone.minEquals;
}

function milestoneTimeProgress(summary: Summary, milestone: ProgressMilestone) {
  const target = milestoneTimeTarget(milestone);
  const reached = Math.min(summary.reward.earnedSeconds, target);

  return `${formatCompactDuration(reached)}/${formatCompactDuration(target)}`;
}

function milestoneEqualsProgress(summary: Summary, milestone: ProgressMilestone) {
  const target = milestoneEqualsTarget(milestone);
  const reached = Math.min(summary.reward.totalEquals, target);

  return `${reached}/${target}`;
}

function findTier(summary: Summary, percent: number) {
  return summary.reward.tiers.find((tier) => tier.percent === percent);
}

function milestoneClaimState(tier: RewardTier | undefined, passed: boolean): MilestoneClaimState {
  if (!tier) return passed ? 'ready' : 'locked';
  if (tier.redeemed || tier.status === 'redeemed') return 'claimed';
  if (tier.status === 'ready' || passed) return 'ready';

  return 'locked';
}

export function milestoneStateLabel(state: MilestoneClaimState) {
  if (state === 'claimed') return 'claimed';
  if (state === 'ready') return 'claim';

  return 'locked';
}

export function getProgressSummary(summary: Summary): ProgressSummary {
  const timeTarget = PROGRESS_MILESTONES[PROGRESS_MILESTONES.length - 1].minSeconds;
  const equalsTarget = PROGRESS_MILESTONES[PROGRESS_MILESTONES.length - 1].minEquals;
  const timeEffort = safePercent(summary.reward.earnedSeconds, timeTarget);
  const equalsEffort = safePercent(summary.reward.totalEquals, equalsTarget);
  const timePercent = Math.min(100, Math.round(effortToProgress(timeEffort)));
  const equalsPercent = Math.min(100, Math.round(effortToProgress(equalsEffort)));
  const breakProgress = Math.round(effortToProgress(Math.min(timeEffort, equalsEffort)));
  const milestones = PROGRESS_MILESTONES.map((milestone) => {
    const timeReached = summary.reward.earnedSeconds >= milestoneTimeTarget(milestone);
    const equalsReached = summary.reward.totalEquals >= milestoneEqualsTarget(milestone);
    const passed = timeReached && equalsReached;
    const tier = findTier(summary, milestone.label);
    const state = milestoneClaimState(tier, passed);

    return {
      milestone,
      timeReached,
      equalsReached,
      timeProgress: milestoneTimeProgress(summary, milestone),
      equalsProgress: milestoneEqualsProgress(summary, milestone),
      timePercent: Math.min(100, Math.max(0, safePercent(summary.reward.earnedSeconds, milestoneTimeTarget(milestone)))),
      equalsPercent: Math.min(100, Math.max(0, safePercent(summary.reward.totalEquals, milestoneEqualsTarget(milestone)))),
      state,
      rewardCode: tier?.code ?? milestone.code,
    };
  });

  return {
    breakProgress,
    timePercent,
    equalsPercent,
    milestones,
  };
}
