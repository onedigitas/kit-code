export const PET_DISPLAY_SCALE = 0.65;
export const PET_ATLAS_WIDTH = 1536;
export const PET_ATLAS_HEIGHT = 2288;
export const PET_SPRITE_WIDTH = Math.round(192 * PET_DISPLAY_SCALE);
export const PET_SPRITE_HEIGHT = Math.round(208 * PET_DISPLAY_SCALE);
// Shell fits bubble + sprite; host height adds a separate footer for the mode switcher.
export const PET_SHELL_HEIGHT = Math.round(280 * PET_DISPLAY_SCALE);
export const PET_WIDTH = Math.round(248 * PET_DISPLAY_SCALE);
export const PET_CONTROL_FOOTER_HEIGHT = 36;
export const PET_HEIGHT = Math.round(6 * PET_DISPLAY_SCALE) + PET_SHELL_HEIGHT + PET_CONTROL_FOOTER_HEIGHT;
export const PET_SPRITE_BG_WIDTH = Math.round(PET_ATLAS_WIDTH * PET_DISPLAY_SCALE);
export const PET_SPRITE_BG_HEIGHT = Math.round(PET_ATLAS_HEIGHT * PET_DISPLAY_SCALE);
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
