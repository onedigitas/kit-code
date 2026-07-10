export const PET_SPRITE_WIDTH = 192;
export const PET_SPRITE_HEIGHT = 208;
export const PET_WIDTH = 248;
export const PET_HEIGHT = 272;
export const PET_MOVE_SPEED = 3;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

export function clampPetPosition(position, workArea) {
  return {
    x: clamp(position.x, workArea.x, workArea.x + workArea.width - PET_WIDTH),
    y: clamp(position.y, workArea.y, workArea.y + workArea.height - PET_HEIGHT),
  };
}

export function nextPetStep(position, target, workArea, speed = PET_MOVE_SPEED) {
  const deltaX = target.x - position.x;
  const deltaY = target.y - position.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= speed) {
    return {
      arrived: true,
      motionState: 'idle',
      position: clampPetPosition(target, workArea),
    };
  }

  return {
    arrived: false,
    motionState: deltaX < 0 ? 'walking-left' : 'walking-right',
    position: clampPetPosition({
      x: Math.round(position.x + ((deltaX / distance) * speed)),
      y: Math.round(position.y + ((deltaY / distance) * speed)),
    }, workArea),
  };
}
