#!/usr/bin/env node

import {spawn} from 'node:child_process';
import process from 'node:process';
import {createServer} from '../src/api.mjs';
import {runPromptHook} from '../src/hook-prompt.mjs';
import {installIntegration, integrationStatus, uninstallIntegration} from '../src/integration-installers.mjs';
import {
  configureRewardSettings,
  DEFAULT_REWARD_EQUALS,
  getDiskRewardSummary,
  normalizeTierPercent,
  redeemReadyTiers,
} from '../src/reward.mjs';
import {
  createRuntime,
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_REWARD_SECONDS,
  listProjects,
  registerProject,
  removeProject,
  setAllProjectsActive,
  setProjectActiveByPath,
  startWatchers,
} from '../src/runtime.mjs';

const VERSION = '0.1.5';
const DASHBOARD_URL = 'https://kitcode.onedigitas.com/';
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const COLOR = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  underline: '\x1b[4m',
};

function parseBooleanEnv(value) {
  return value === '1' || value === 'true' || value === 'yes';
}

function colorize(value, ...styles) {
  if (!USE_COLOR) {
    return value;
  }

  return `${styles.join('')}${value}${COLOR.reset}`;
}

function createStatusReporter() {
  const frames = ['-', '\\', '|', '/'];
  const useSpinner = process.stdout.isTTY && !process.env.CI;
  let frameIndex = 0;
  let message = '';
  let timer = null;
  let lastPlainMessage = '';

  const clear = () => {
    if (useSpinner && message) {
      process.stdout.write('\r\x1b[2K');
    }
  };

  const render = () => {
    if (!useSpinner || !message) {
      return;
    }

    const frame = colorize(frames[frameIndex % frames.length], COLOR.cyan);
    frameIndex += 1;
    process.stdout.write(`\r${frame} ${message}`);
  };

  return {
    set(nextMessage) {
      if (!nextMessage || nextMessage === message) {
        return;
      }

      message = nextMessage;

      if (!useSpinner) {
        if (lastPlainMessage !== nextMessage) {
          console.log(nextMessage);
          lastPlainMessage = nextMessage;
        }

        return;
      }

      render();
      timer ??= setInterval(render, 120);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }

      clear();
      message = '';
    },
  };
}

function parseArgs(argv) {
  const firstArg = argv[2];
  const command = !firstArg || (
    firstArg.startsWith('-') &&
    firstArg !== '--help' &&
    firstArg !== '-h' &&
    firstArg !== '--version' &&
    firstArg !== '-v'
  ) ? 'run' : firstArg;
  const options = {
    command,
    subcommand: argv[3],
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    rewardSeconds: undefined,
    rewardEquals: undefined,
    source: undefined,
    tier: undefined,
    openDashboard: !parseBooleanEnv(process.env.KITCODE_NO_OPEN),
  };

  if (options.command === '--help' || options.command === '-h') {
    options.command = 'help';
  } else if (options.command === '--version' || options.command === '-v') {
    options.command = 'version';
  }

  for (let index = command === firstArg ? 3 : 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--host' && next) {
      options.host = next;
      index += 1;
    } else if (arg === '--port' && next) {
      options.port = Number(next);
      index += 1;
    } else if (arg === '--reward-seconds' && next) {
      options.rewardSeconds = Number(next);
      index += 1;
    } else if (arg === '--reward-equals' && next) {
      options.rewardEquals = Number(next);
      index += 1;
    } else if (arg === '--source' && next) {
      options.source = next;
      index += 1;
    } else if (arg === '--tier' && next) {
      options.tier = Number(next);
      index += 1;
    } else if (arg === '--no-open') {
      options.openDashboard = false;
    } else if (arg === '--version' || arg === '-v') {
      options.command = 'version';
    } else if (arg === '--help' || arg === '-h') {
      options.command = 'help';
    }
  }

  if (process.env.KITCODE_REWARD_SECONDS) {
    options.rewardSeconds = Number(process.env.KITCODE_REWARD_SECONDS);
  }

  if (process.env.KITCODE_REWARD_EQUALS) {
    options.rewardEquals = Number(process.env.KITCODE_REWARD_EQUALS);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: kitcode [command] [options]

Commands:
  kitcode               Register this folder and start or reuse the local server
  serve                 Start the local KitCode server
  add [path]            Register a folder, default current directory
  break                 Pause tracking for the current folder
  list                  Show active folder totals
  start                 Turn on all folders
  stop                  Turn off all folders
  remove [path]         Remove a folder from local state, default current directory
  reward                Show local reward progress
  redeem [--tier <n>]   Redeem ready voucher milestones
  hook prompt --source codex|claude
                        Internal prompt hook used by Codex and Claude
  codex on|off|status   Install, remove, or inspect the Codex hook and skill
  claude on|off|status  Install, remove, or inspect the Claude hook and skill

Options:
  --host <host>         Host to bind, default ${DEFAULT_HOST}
  --port <port>         Port to bind, default ${DEFAULT_PORT}
  --reward-seconds <n>  Reward target, default ${DEFAULT_REWARD_SECONDS}
  --reward-equals <n>   Reward equals target, default ${DEFAULT_REWARD_EQUALS}
  --no-open             Do not open the hosted dashboard automatically
  -v, --version         Print version
  -h, --help            Print help
`);
}

function openDashboard(url) {
  const opener = process.platform === 'darwin'
    ? {command: 'open', args: [url]}
    : process.platform === 'win32'
      ? {command: 'cmd', args: ['/c', 'start', '', url]}
      : {command: 'xdg-open', args: [url]};

  try {
    const child = spawn(opener.command, opener.args, {
      detached: true,
      stdio: 'ignore',
    });

    child.on('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function printDashboardHint(options) {
  console.log(`${colorize('Dashboard', COLOR.bold)}: ${colorize(DASHBOARD_URL, COLOR.cyan, COLOR.underline)}`);

  if (!options.openDashboard) {
    console.log(colorize('Open dashboard manually when you are ready.', COLOR.dim));
    return;
  }

  console.log(colorize('Opening dashboard in your browser...', COLOR.green));

  if (!openDashboard(DASHBOARD_URL)) {
    console.log(colorize('Could not open the browser automatically. Paste the dashboard URL above.', COLOR.yellow));
  }
}

function printServerReady(options, runtime) {
  const activeFolders = Object.values(runtime.state.projects).filter((project) => project.active).length;

  console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is live.`);
  console.log(`${colorize('Active folders', COLOR.bold)}: ${colorize(String(activeFolders), COLOR.green, COLOR.bold)}`);
  printDashboardHint(options);
  console.log(`Keep this terminal open. Press ${colorize('Ctrl+C', COLOR.yellow, COLOR.bold)} to stop tracking.`);
}

function printRewardSummary(reward) {
  console.log(`${colorize('Reward progress', COLOR.bold)}: ${Math.round(reward.progress * 100)}%`);
  console.log(`Active time: ${Math.floor(reward.earnedSeconds)}s / ${reward.requiredSeconds}s`);
  console.log(`Equal (=) presses: ${reward.totalEquals} / ${reward.requiredEquals}`);

  for (const tier of reward.tiers) {
    const label = `${tier.percent}%`;
    const status = tier.status.toUpperCase();
    const code = tier.status === 'locked' ? '' : ` ${tier.code}`;

    console.log(`${label}: ${status}${code}`);
  }
}

function printRedeemResult(result) {
  if (result.redeemed.length === 0) {
    console.log('No ready vouchers to redeem.');
    return;
  }

  for (const tier of result.redeemed) {
    console.log(`Redeemed ${tier.percent}% voucher: ${tier.code}`);
  }
}

function printIntegrationStatus(source, status) {
  console.log(`${source}:`);
  if (status.runner) {
    console.log(`  runner: ${status.runner.installed ? 'installed' : 'not installed'}`);
    console.log(`  runner file: ${status.runner.path}`);
  }

  console.log(`  hook: ${status.hook.installed ? 'installed' : 'not installed'}`);
  console.log(`  config: ${status.hook.path}`);
  if (status.hook.command) {
    console.log(`  hook command: ${status.hook.command}`);
  }

  console.log(`  skill: ${status.skill.installed ? 'installed' : 'not installed'}`);
  console.log(`  skill file: ${status.skill.path}`);

  if (source === 'codex' && status.hook.installed) {
    console.log('Open /hooks in Codex to review and trust the KitCode hook.');
  }
}

function handleHookInstaller(source, action) {
  if (action === 'on') {
    const status = installIntegration(source);
    printIntegrationStatus(source, status);
    return;
  }

  if (action === 'off') {
    const status = uninstallIntegration(source);
    printIntegrationStatus(source, status);
    return;
  }

  if (action === 'status') {
    printIntegrationStatus(source, integrationStatus(source));
    return;
  }

  printHelp();
  process.exit(1);
}

async function isServerRunning(options) {
  try {
    const response = await fetch(`http://${options.host}:${options.port}/api/health`, {
      signal: AbortSignal.timeout(800),
    });

    if (!response.ok) {
      return false;
    }

    const health = await response.json();

    return health?.status === 'ok' && health?.app === 'kitcode';
  } catch {
    return false;
  }
}

function serve(options, status = createStatusReporter()) {
  status.set('Starting local KitCode server...');
  const runtime = createRuntime(options);
  const app = createServer(runtime, VERSION);
  let cleanup = () => {};

  cleanup = startWatchers(runtime, {
    onProgress(message) {
      status.set(message);
    },
  });

  const server = app.listen(options.port, options.host, () => {
    status.stop();
    printServerReady(options, runtime);
  });

  server.on('error', (error) => {
    status.stop();

    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${options.port} is already in use. Stop the other server or pass --port <port>.`);
      process.exit(1);
    }

    console.error(error.message);
    process.exit(1);
  });

  const shutdown = () => {
    console.log('\nShutting down KitCode server...');
    cleanup();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const options = parseArgs(process.argv);

if (options.command === 'run') {
  const status = createStatusReporter();
  status.set('Registering this folder...');
  const totals = registerProject('.');

  status.stop();
  console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is on for this folder.`);
  status.set('Checking local server...');

  if (await isServerRunning(options)) {
    status.stop();
    console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is already live.`);
    console.log(`${colorize('Active folders', COLOR.bold)}: ${colorize(String(totals.trackingProjects), COLOR.green, COLOR.bold)}`);
    printDashboardHint(options);
  } else {
    serve(options, status);
  }
} else if (options.command === 'serve') {
  serve(options);
} else if (options.command === 'add') {
  const totals = registerProject(process.argv[3] ?? '.');
  console.log('KitCode is on for this folder.');
  console.log(`Active folders: ${totals.trackingProjects}`);
} else if (options.command === 'break') {
  const totals = setProjectActiveByPath('.', false);

  if (!totals) {
    console.error('No tracked folder found.');
    process.exit(1);
  }

  console.log('Break started.');
  console.log(`Active folders: ${totals.trackingProjects}`);
} else if (options.command === 'list') {
  const totals = listProjects();

  if (totals.trackingProjects === 0) {
    console.log('No active folders. Run: kitcode');
  } else {
    console.log(`Active folders: ${totals.trackingProjects}`);
  }
} else if (options.command === 'start') {
  const totals = setAllProjectsActive(true);
  console.log('Tracking started.');
  console.log(`Active folders: ${totals.trackingProjects}`);
} else if (options.command === 'stop') {
  const totals = setAllProjectsActive(false);
  console.log('Tracking stopped.');
  console.log(`Active folders: ${totals.trackingProjects}`);
} else if (options.command === 'remove') {
  const targetPath = process.argv[3] ?? '.';
  const totals = removeProject(targetPath);

  if (!totals) {
    console.error('Folder not found.');
    process.exit(1);
  }

  console.log('Folder removed.');
  console.log(`Active folders: ${totals.trackingProjects}`);
} else if (options.command === 'reward') {
  configureRewardSettings(options);
  printRewardSummary(getDiskRewardSummary());
} else if (options.command === 'redeem') {
  configureRewardSettings(options);

  if (options.tier !== undefined && !normalizeTierPercent(options.tier)) {
    console.error('Invalid tier. Use 10, 20, or 30.');
    process.exit(1);
  }

  printRedeemResult(redeemReadyTiers(options.tier ?? null));
} else if (options.command === 'hook' && options.subcommand === 'prompt') {
  await runPromptHook({source: options.source});
} else if (options.command === 'codex') {
  handleHookInstaller('codex', options.subcommand);
} else if (options.command === 'claude') {
  handleHookInstaller('claude', options.subcommand);
} else if (options.command === 'version') {
  console.log(VERSION);
} else {
  printHelp();
  process.exit(options.command === 'help' || !options.command ? 0 : 1);
}
