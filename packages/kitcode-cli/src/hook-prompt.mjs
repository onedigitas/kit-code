import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {formatBreakDuration, nextBreakReminder} from './next-break-reminder.mjs';
import {getDiskRewardSummary, getReadyUnannouncedTiers, markTiersAnnounced} from './reward.mjs';
import {STORE_DIR} from './store.mjs';

export const HOOK_LOG_PATH = path.join(STORE_DIR, 'hook.log');

function isDisabled() {
  return ['1', 'true', 'yes'].includes(String(process.env.KITCODE_HOOKS_OFF ?? '').toLowerCase());
}

function isKitCodeManagementPrompt(prompt) {
  const trimmed = String(prompt ?? '').trim().toLowerCase();

  return trimmed === 'kitcode' ||
    trimmed.startsWith('kitcode ') ||
    trimmed === '/kitcode' ||
    trimmed.startsWith('/kitcode ');
}

function logHookError(error) {
  try {
    fs.mkdirSync(STORE_DIR, {recursive: true});
    fs.appendFileSync(
      HOOK_LOG_PATH,
      `${new Date().toISOString()} ${error?.stack ?? error?.message ?? String(error)}\n`,
    );
  } catch {
    // Keep hooks fail-open even when logging fails.
  }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let input = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('error', reject);
    process.stdin.on('end', () => resolve(input));
  });
}

function notify(title, message) {
  const command = process.platform === 'darwin'
    ? {
      bin: 'osascript',
      args: ['-e', `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`],
    }
    : process.platform === 'win32'
      ? {
        bin: 'powershell.exe',
        args: ['-NoProfile', '-Command', `[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show(${JSON.stringify(message)}, ${JSON.stringify(title)})`],
      }
      : {
        bin: 'notify-send',
        args: [title, message],
      };

  try {
    const child = spawn(command.bin, command.args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });

    child.on('error', () => {});
    child.unref();
  } catch {
    // Desktop notifications are best-effort.
  }
}

function progressContextFor(reward) {
  const nextBreak = reward.nextBreak ?? nextBreakReminder(reward);
  const ready = reward.milestones.filter((entry) => entry.status === 'ready' && !entry.redeemed);
  const parts = [
    `KitCode progress: ${reward.totalEquals} = counted, ${formatBreakDuration(reward.earnedSeconds)} active.`,
  ];

  if (ready.length > 0) {
    parts.push(`Reward ready at ${ready.map((entry) => `${entry.percent}%`).join(', ')}. Mention \`kitcode dashboard\` briefly after this turn.`);
  }

  if (nextBreak) {
    const almost = nextBreak.almost ? ' Almost there.' : '';
    parts.push(
      `Next break milestone: ${nextBreak.percent}% (${nextBreak.progressPercent}% there, ${nextBreak.equalsLeft} = and ${nextBreak.durationLeft} left).${almost}`,
    );
    parts.push(`After this turn, briefly mention remaining progress in one short line like: ${nextBreak.mentionLine}`);
  }

  return parts.join(' ');
}

function hookOutputFor({tiers = [], reward = null}) {
  const progressContext = reward ? progressContextFor(reward) : '';

  if (tiers.length === 0) {
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: progressContext,
      },
    };
  }

  const labels = tiers.map((tier) => `${tier.percent}%`).join(', ');
  const command = 'kitcode dashboard';
  const additionalContext = [
    progressContext,
    `KitCode voucher ready (${labels}). Briefly tell the user they can open the dashboard with \`${command}\` after this turn.`,
  ].filter(Boolean).join(' ');

  return {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext,
    },
  };
}

export async function runPromptHook({source}) {
  if (isDisabled()) {
    return;
  }

  try {
    const input = await readStdin();
    const payload = JSON.parse(input || '{}');

    if (isKitCodeManagementPrompt(payload.prompt)) {
      return;
    }

    const reward = getDiskRewardSummary();
    const readyTiers = getReadyUnannouncedTiers(source);

    if (readyTiers.length === 0) {
      process.stdout.write(`${JSON.stringify(hookOutputFor({reward}))}\n`);
      return;
    }

    const announced = markTiersAnnounced(source, readyTiers);

    if (announced.length === 0) {
      process.stdout.write(`${JSON.stringify(hookOutputFor({reward}))}\n`);
      return;
    }

    const label = announced.map((tier) => `${tier.percent}%`).join(', ');
    notify('KitCode voucher ready', `Milestone ${label} unlocked. Open kitcode dashboard.`);
    process.stdout.write(`${JSON.stringify(hookOutputFor({tiers: announced, reward}))}\n`);
  } catch (error) {
    logHookError(error);
  }
}
