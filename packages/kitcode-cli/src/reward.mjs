import {loadEqualsLedger, saveEqualsLedger} from './equals-ledger.mjs';
import {KITCODE_DISPLAY_MILESTONES, KITCODE_REWARD_TIERS} from './integration-spec.mjs';
import {loadState, saveState} from './store.mjs';

export const DEFAULT_REWARD_SECONDS = 3600;
export const DEFAULT_REWARD_EQUALS = 30;
export const REWARD_TIERS = KITCODE_REWARD_TIERS;
export const CAMPAIGN_MILESTONES = KITCODE_DISPLAY_MILESTONES;
export const REWARD_MILESTONES = [
  ...REWARD_TIERS.map((tier) => ({...tier, rewardBacked: true})),
  ...CAMPAIGN_MILESTONES.map((milestone) => ({...milestone, rewardBacked: false})),
];

const VALID_TIER_PERCENTS = new Set(REWARD_TIERS.map((tier) => tier.percent));

function positiveNumber(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }

  return number;
}

function normalizeSource(source) {
  return source === 'codex' || source === 'claude' ? source : null;
}

export function normalizeTierPercent(value) {
  const percent = Number(value);

  if (!VALID_TIER_PERCENTS.has(percent)) {
    return null;
  }

  return percent;
}

function normalizeTierRecord(entry) {
  const percent = normalizeTierPercent(
    typeof entry === 'object' && entry !== null ? entry.percent : entry,
  );

  if (!percent) {
    return null;
  }

  const announcedAt = entry?.announced_at && typeof entry.announced_at === 'object'
    ? Object.fromEntries(
      Object.entries(entry.announced_at)
        .filter(([source, value]) => normalizeSource(source) && typeof value === 'string'),
    )
    : {};

  return {
    percent,
    redeemed_at: typeof entry?.redeemed_at === 'string' ? entry.redeemed_at : null,
    announced_at: announcedAt,
  };
}

export function normalizeEarnedTiers(entries) {
  const records = new Map();

  for (const entry of Array.isArray(entries) ? entries : []) {
    const record = normalizeTierRecord(entry);

    if (!record) {
      continue;
    }

    const existing = records.get(record.percent);
    records.set(record.percent, {
      percent: record.percent,
      redeemed_at: existing?.redeemed_at ?? record.redeemed_at,
      announced_at: {
        ...(existing?.announced_at ?? {}),
        ...record.announced_at,
      },
    });
  }

  return [...records.values()].sort((a, b) => a.percent - b.percent);
}

export function getRewardSettings() {
  const state = loadState();
  const settings = state.rewardSettings && typeof state.rewardSettings === 'object'
    ? state.rewardSettings
    : {};

  return {
    requiredSeconds: Math.max(1, positiveNumber(settings.requiredSeconds, DEFAULT_REWARD_SECONDS)),
    requiredEquals: Math.max(1, positiveNumber(settings.requiredEquals, DEFAULT_REWARD_EQUALS)),
  };
}

export function configureRewardSettings(options = {}) {
  const state = loadState();
  const current = getRewardSettings();
  const next = {
    requiredSeconds: Math.max(1, positiveNumber(options.rewardSeconds, current.requiredSeconds)),
    requiredEquals: Math.max(1, positiveNumber(options.rewardEquals, current.requiredEquals)),
  };

  if (
    state.rewardSettings?.requiredSeconds !== next.requiredSeconds ||
    state.rewardSettings?.requiredEquals !== next.requiredEquals
  ) {
    saveState({
      ...state,
      rewardSettings: next,
    });
  }

  return next;
}

function tierRecordMap(ledger) {
  return new Map(normalizeEarnedTiers(ledger.earned_tiers).map((record) => [record.percent, record]));
}

function milestoneTimeTarget(requiredSeconds, percent) {
  return Math.ceil(requiredSeconds * (percent / 100));
}

export function buildRewardSummary({earnedSeconds, totalEquals, settings, ledger}) {
  const requiredSeconds = Math.max(1, settings.requiredSeconds);
  const requiredEquals = Math.max(1, settings.requiredEquals);
  const records = tierRecordMap(ledger);
  const normalizedEarnedSeconds = Math.floor(Math.max(0, Number(earnedSeconds) || 0));
  const normalizedTotalEquals = Math.max(0, Number(totalEquals) || 0);
  const tiers = REWARD_TIERS.map((tier) => {
    const record = records.get(tier.percent);
    const requiredTimeSeconds = milestoneTimeTarget(requiredSeconds, tier.percent);
    const unlocked = (
      normalizedEarnedSeconds >= requiredTimeSeconds &&
      normalizedTotalEquals >= tier.requiredEquals
    );
    const redeemed = Boolean(record?.redeemed_at);

    return {
      code: tier.code,
      percent: tier.percent,
      requiredEquals: tier.requiredEquals,
      requiredSeconds: requiredTimeSeconds,
      unlocked,
      redeemed,
      redeemedAt: record?.redeemed_at ?? null,
      status: redeemed ? 'redeemed' : unlocked ? 'ready' : 'locked',
    };
  });
  const tierMap = new Map(tiers.map((tier) => [tier.percent, tier]));

  return {
    requiredSeconds,
    requiredEquals,
    earnedSeconds: normalizedEarnedSeconds,
    totalEquals: normalizedTotalEquals,
    timeLeftSeconds: Math.max(0, Math.floor(requiredSeconds - normalizedEarnedSeconds)),
    progress: Math.min(1, normalizedEarnedSeconds / requiredSeconds),
    tiers,
    milestones: REWARD_MILESTONES.map((milestone) => {
      const tier = tierMap.get(milestone.percent);
      const requiredTimeSeconds = tier?.requiredSeconds ?? milestoneTimeTarget(requiredSeconds, milestone.percent);
      const timeReached = normalizedEarnedSeconds >= requiredTimeSeconds;
      const equalsReached = normalizedTotalEquals >= milestone.requiredEquals;
      const unlocked = timeReached && equalsReached;

      return {
        code: tier?.code ?? milestone.code,
        percent: milestone.percent,
        requiredEquals: milestone.requiredEquals,
        requiredSeconds: requiredTimeSeconds,
        rewardBacked: milestone.rewardBacked,
        displayOnly: !milestone.rewardBacked,
        unlocked,
        redeemed: tier?.redeemed ?? false,
        redeemedAt: tier?.redeemedAt ?? null,
        status: tier?.status ?? (unlocked ? 'ready' : 'locked'),
      };
    }),
  };
}

export function getDiskRewardSummary() {
  const state = loadState();
  const projects = Object.values(state.projects ?? {});
  const ledger = loadEqualsLedger();
  const settings = getRewardSettings();
  const earnedSeconds = projects.reduce((sum, project) => sum + (Number(project.activeSeconds) || 0), 0);

  return buildRewardSummary({
    earnedSeconds,
    totalEquals: ledger.total_equals,
    settings,
    ledger,
  });
}

function saveTierRecords(ledger, records) {
  ledger.earned_tiers = [...records.values()].sort((a, b) => a.percent - b.percent);
  ledger.last_updated_at = new Date().toISOString();
  saveEqualsLedger(ledger);
}

export function redeemReadyTiers(percent = null) {
  const requestedPercent = percent === null ? null : normalizeTierPercent(percent);

  if (percent !== null && !requestedPercent) {
    return {redeemed: [], skipped: [], reward: getDiskRewardSummary()};
  }

  const ledger = loadEqualsLedger();
  const reward = getDiskRewardSummary();
  const records = tierRecordMap(ledger);
  const now = new Date().toISOString();
  const redeemed = [];
  const skipped = [];

  for (const tier of reward.tiers) {
    if (requestedPercent && tier.percent !== requestedPercent) {
      continue;
    }

    if (tier.status !== 'ready') {
      skipped.push(tier);
      continue;
    }

    const record = records.get(tier.percent) ?? {percent: tier.percent, redeemed_at: null, announced_at: {}};
    record.redeemed_at = now;
    records.set(tier.percent, record);
    redeemed.push({...tier, redeemed: true, redeemedAt: now, status: 'redeemed'});
  }

  if (redeemed.length > 0) {
    saveTierRecords(ledger, records);
  }

  return {
    redeemed,
    skipped,
    reward: getDiskRewardSummary(),
  };
}

export function markTiersAnnounced(source, tiers) {
  const normalizedSource = normalizeSource(source);

  if (!normalizedSource || tiers.length === 0) {
    return [];
  }

  const ledger = loadEqualsLedger();
  const records = tierRecordMap(ledger);
  const now = new Date().toISOString();
  const announced = [];

  for (const tier of tiers) {
    const percent = normalizeTierPercent(tier.percent);

    if (!percent) {
      continue;
    }

    const record = records.get(percent) ?? {percent, redeemed_at: null, announced_at: {}};
    record.announced_at = {
      ...record.announced_at,
      [normalizedSource]: now,
    };
    records.set(percent, record);
    announced.push({...tier, announcedAt: now});
  }

  if (announced.length > 0) {
    saveTierRecords(ledger, records);
  }

  return announced;
}

export function getReadyUnannouncedTiers(source) {
  const normalizedSource = normalizeSource(source);

  if (!normalizedSource) {
    return [];
  }

  const ledger = loadEqualsLedger();
  const records = tierRecordMap(ledger);

  return getDiskRewardSummary().tiers.filter((tier) => {
    const record = records.get(tier.percent);

    return tier.status === 'ready' && !record?.announced_at?.[normalizedSource];
  });
}
