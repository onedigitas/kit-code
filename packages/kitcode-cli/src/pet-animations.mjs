export const PET_ATLAS = Object.freeze({
  width: 1536,
  height: 2288,
  columns: 8,
  rows: 11,
  cellWidth: 192,
  cellHeight: 208,
  spriteVersionNumber: 2,
  spritesheetPath: '/pet-assets/kit-terminal/spritesheet.webp',
});

function animation(row, durations, options = {}) {
  return Object.freeze({
    row,
    frames: Object.freeze(durations.map((_, index) => index)),
    durations: Object.freeze(durations),
    loop: options.loop ?? true,
  });
}

export const PET_ANIMATIONS = Object.freeze({
  idle: animation(0, [280, 110, 110, 140, 140, 320]),
  'walking-right': animation(1, [120, 120, 120, 120, 120, 120, 120, 220]),
  'walking-left': animation(2, [120, 120, 120, 120, 120, 120, 120, 220]),
  waving: animation(3, [140, 140, 140, 280]),
  jumping: animation(4, [140, 140, 140, 140, 280]),
  failed: animation(5, [140, 140, 140, 140, 140, 140, 140, 240]),
  waiting: animation(6, [150, 150, 150, 150, 150, 260]),
  working: animation(7, [120, 120, 120, 120, 120, 220]),
  blink: animation(8, [110, 110, 140, 160, 110, 320]),
  review: animation(8, [150, 150, 150, 150, 150, 280]),
});

export function petAnimationForSummary(summary, connectionState = 'online') {
  if (connectionState === 'offline') {
    return 'failed';
  }

  if (connectionState === 'reconnecting') {
    return 'waiting';
  }

  return 'idle';
}

export function effectivePetAnimation(baseAnimation, motionState) {
  if (
    motionState === 'walking-left' ||
    motionState === 'walking-right' ||
    motionState === 'waving' ||
    motionState === 'jumping' ||
    motionState === 'working' ||
    motionState === 'review' ||
    motionState === 'blink'
  ) {
    return motionState;
  }

  if (
    baseAnimation === 'jumping' ||
    baseAnimation === 'failed' ||
    baseAnimation === 'waiting' ||
    baseAnimation === 'working' ||
    baseAnimation === 'review' ||
    baseAnimation === 'blink'
  ) {
    return baseAnimation;
  }

  return baseAnimation;
}
