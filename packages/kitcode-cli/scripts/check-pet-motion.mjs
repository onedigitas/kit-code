import {strict as assert} from 'node:assert';
import {
  clampPetPosition,
  nextPetStep,
  PET_HEIGHT,
  PET_MOVE_SPEED,
  PET_WIDTH,
} from '../src/pet-motion.mjs';

const primary = {x: 0, y: 25, width: 1440, height: 875};
const secondary = {x: -1920, y: 0, width: 1920, height: 1080};

assert.deepEqual(clampPetPosition({x: -40, y: -80}, primary), {x: 0, y: 25});
assert.deepEqual(clampPetPosition({x: 1800, y: 1200}, primary), {
  x: primary.x + primary.width - PET_WIDTH,
  y: primary.y + primary.height - PET_HEIGHT,
});
assert.deepEqual(clampPetPosition({x: -2500, y: 1500}, secondary), {
  x: secondary.x,
  y: secondary.y + secondary.height - PET_HEIGHT,
});

const leftStep = nextPetStep({x: 100, y: 100}, {x: 0, y: 100}, primary);
assert.equal(leftStep.arrived, false);
assert.equal(leftStep.motionState, 'walking-left');
assert.deepEqual(leftStep.position, {x: 100 - PET_MOVE_SPEED, y: 100});

const rightStep = nextPetStep({x: 100, y: 100}, {x: 200, y: 130}, primary);
assert.equal(rightStep.arrived, false);
assert.equal(rightStep.motionState, 'walking-right');
assert.ok(rightStep.position.x > 100);
assert.ok(rightStep.position.y > 100);

const arrived = nextPetStep({x: 101, y: 101}, {x: 103, y: 102}, primary);
assert.equal(arrived.arrived, true);
assert.equal(arrived.motionState, 'idle');
assert.deepEqual(arrived.position, {x: 103, y: 102});

const clampedStep = nextPetStep(
  {x: secondary.x, y: secondary.y},
  {x: secondary.x - 500, y: secondary.y - 500},
  secondary,
);
assert.deepEqual(clampedStep.position, {x: secondary.x, y: secondary.y});

console.log('Pet motion checks passed.');
