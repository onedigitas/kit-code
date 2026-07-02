import {strict as assert} from 'node:assert';
import {buildRewardSummary} from '../src/reward.mjs';

function summary({earnedSeconds, totalEquals, earnedTiers = []}) {
  return buildRewardSummary({
    earnedSeconds,
    totalEquals,
    settings: {
      requiredSeconds: 3600,
      requiredEquals: 30,
    },
    ledger: {
      total_equals: totalEquals,
      earned_tiers: earnedTiers,
    },
  });
}

function milestone(reward, percent) {
  const result = reward.milestones.find((entry) => entry.percent === percent);
  assert.ok(result, `Expected ${percent}% milestone`);

  return result;
}

{
  const reward = summary({
    earnedSeconds: 684,
    totalEquals: 31,
    earnedTiers: [{percent: 10, redeemed_at: '2026-07-02T07:41:58.710Z'}],
  });

  assert.equal(milestone(reward, 10).status, 'redeemed');
  assert.equal(milestone(reward, 20).status, 'locked');
  assert.equal(milestone(reward, 30).status, 'locked');
  assert.equal(milestone(reward, 50).status, 'locked');
  assert.equal(milestone(reward, 100).status, 'locked');
}

{
  const reward = summary({earnedSeconds: 720, totalEquals: 6});

  assert.equal(milestone(reward, 20).status, 'ready');
}

{
  const reward = summary({earnedSeconds: 1800, totalEquals: 12});
  const mediumStake = milestone(reward, 50);

  assert.equal(mediumStake.status, 'ready');
  assert.equal(mediumStake.rewardBacked, false);
  assert.equal(reward.tiers.some((tier) => tier.percent === 50), false);
}

{
  const reward = summary({earnedSeconds: 3600, totalEquals: 15});

  assert.equal(milestone(reward, 100).status, 'ready');
}

console.log('Reward summary checks passed.');
