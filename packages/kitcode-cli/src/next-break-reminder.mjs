export function formatBreakDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

export function equalsToBreakCopy(equalsLeft) {
  const remaining = Math.max(0, Math.floor(Number(equalsLeft) || 0));
  return remaining === 0 ? '= done' : `${remaining} = to break`;
}

export function timeToBreakCopy(secondsLeft, durationLeft = formatBreakDuration(secondsLeft)) {
  const remaining = Math.max(0, Math.floor(Number(secondsLeft) || 0));
  return remaining === 0 ? 'time done' : `${durationLeft} to break`;
}

export function findNextBreakMilestone(milestones = []) {
  const list = Array.isArray(milestones) ? milestones : [];

  return list.find((milestone) => (
    !milestone.redeemed &&
    milestone.status !== 'ready' &&
    milestone.status !== 'redeemed' &&
    !milestone.unlocked
  )) ?? list.find((milestone) => !milestone.redeemed && milestone.status === 'locked') ?? null;
}

export function nextBreakReminder(reward) {
  if (!reward || typeof reward !== 'object') {
    return null;
  }

  const milestone = findNextBreakMilestone(reward.milestones);
  if (!milestone) {
    return null;
  }

  const earnedSeconds = Math.max(0, Number(reward.earnedSeconds) || 0);
  const totalEquals = Math.max(0, Number(reward.totalEquals) || 0);
  const requiredSeconds = Math.max(0, Number(milestone.requiredSeconds) || 0);
  const requiredEquals = Math.max(0, Number(milestone.requiredEquals) || 0);
  const timeProgress = requiredSeconds > 0 ? earnedSeconds / requiredSeconds : 1;
  const equalsProgress = requiredEquals > 0 ? totalEquals / requiredEquals : 1;
  const progress = Math.min(1, Math.max(0, Math.min(timeProgress, equalsProgress)));
  const progressPercent = Math.round(progress * 100);
  const equalsLeft = Math.max(0, requiredEquals - totalEquals);
  const secondsLeft = Math.max(0, requiredSeconds - earnedSeconds);
  const durationLeft = formatBreakDuration(secondsLeft);
  const almost = progressPercent >= 80;
  const equalsCopy = equalsToBreakCopy(equalsLeft);
  const timeCopy = timeToBreakCopy(secondsLeft, durationLeft);
  const shortLine = `${equalsCopy} · ${timeCopy}`;

  return {
    percent: milestone.percent,
    equalsLeft,
    secondsLeft,
    progressPercent,
    almost,
    durationLeft,
    equalsCopy,
    timeCopy,
    shortLine,
    mentionLine: `Break next: ${shortLine} (${milestone.percent}%).`,
    metaLine: shortLine,
  };
}
