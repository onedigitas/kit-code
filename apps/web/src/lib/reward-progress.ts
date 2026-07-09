import type { Summary } from './kitcode-api';

type ApiMilestone = Summary['reward']['milestones'][number];
export type ProgressMilestone = ApiMilestone & {
  label: ApiMilestone['percent'];
  minEquals: number;
  minSeconds: number;
  threshold: ApiMilestone['percent'];
};
export type MilestoneClaimState = 'claimed' | 'ready' | 'locked';
type RewardStyle = 'primary' | 'kitkat' | 'gold';

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
  rewardBacked: boolean;
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
    imageAlt: 'Red neon Focus Starter gift box',
    imageSrc: '/reward-kitkat-pack.png',
    name: 'Focus Starter',
    style: 'primary',
  },
  20: {
    description: 'Keep your momentum going.',
    imageAlt: 'Red neon Momentum Boost gift box',
    imageSrc: '/reward-kitkat-pack.png',
    name: 'Momentum Boost',
    style: 'primary',
  },
  30: {
    description: "You're doing great!",
    imageAlt: 'Red neon Progress Pack gift box',
    imageSrc: '/reward-kitkat-pack.png',
    name: 'Progress Pack',
    style: 'primary',
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
  const milestoneLabels = [10, 20, 30, 50, 100];

  for (let index = 0; index < milestoneLabels.length; index += 1) {
    const milestoneLabel = milestoneLabels[index];
    const startThreshold = milestoneLabels[index - 1] ?? 0;
    const startLabel = milestoneLabels[index - 1] ?? 0;

    if (normalizedEffort <= milestoneLabel) {
      const thresholdRange = milestoneLabel - startThreshold;
      const labelRange = milestoneLabel - startLabel;
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

function milestoneClaimState(milestone: ProgressMilestone): MilestoneClaimState {
  if (milestone.redeemed || milestone.status === 'redeemed') return 'claimed';
  if (milestone.status === 'ready') return 'ready';

  return 'locked';
}

export function milestoneStateLabel(state: MilestoneClaimState) {
  if (state === 'claimed') return 'claimed';
  if (state === 'ready') return 'claim';

  return 'locked';
}

export function getProgressSummary(summary: Summary): ProgressSummary {
  const progressMilestones = summary.reward.milestones.map((milestone) => ({
    ...milestone,
    label: milestone.percent,
    threshold: milestone.percent,
    minEquals: milestone.requiredEquals,
    minSeconds: milestone.requiredSeconds,
  })) satisfies ProgressMilestone[];
  const finalMilestone = progressMilestones[progressMilestones.length - 1];
  const timeTarget = finalMilestone?.minSeconds ?? summary.reward.requiredSeconds;
  const equalsTarget = finalMilestone?.minEquals ?? summary.reward.requiredEquals;
  const timeEffort = safePercent(summary.reward.earnedSeconds, timeTarget);
  const equalsEffort = safePercent(summary.reward.totalEquals, equalsTarget);
  const timePercent = Math.min(100, Math.round(effortToProgress(timeEffort)));
  const equalsPercent = Math.min(100, Math.round(effortToProgress(equalsEffort)));
  const breakProgress = Math.round(effortToProgress(Math.min(timeEffort, equalsEffort)));
  const milestones = progressMilestones.map((milestone) => {
    const timeReached = summary.reward.earnedSeconds >= milestoneTimeTarget(milestone);
    const equalsReached = summary.reward.totalEquals >= milestoneEqualsTarget(milestone);
    const state = milestoneClaimState(milestone);

    return {
      milestone,
      rewardBacked: milestone.rewardBacked,
      timeReached,
      equalsReached,
      timeProgress: milestoneTimeProgress(summary, milestone),
      equalsProgress: milestoneEqualsProgress(summary, milestone),
      timePercent: Math.min(100, Math.max(0, safePercent(summary.reward.earnedSeconds, milestoneTimeTarget(milestone)))),
      equalsPercent: Math.min(100, Math.max(0, safePercent(summary.reward.totalEquals, milestoneEqualsTarget(milestone)))),
      state,
      rewardCode: milestone.code,
    };
  });

  return {
    breakProgress,
    timePercent,
    equalsPercent,
    milestones,
  };
}
