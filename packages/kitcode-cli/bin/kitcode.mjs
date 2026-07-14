#!/usr/bin/env node

import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {createServer} from '../src/api.mjs';
import {runPromptHook} from '../src/hook-prompt.mjs';
import {installIntegration, integrationStatus, uninstallIntegration} from '../src/integration-installers.mjs';
import {getDiskRewardSummary} from '../src/reward.mjs';
import {
  createRuntime,
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_REWARD_EQUALS,
  DEFAULT_REWARD_SECONDS,
  listProjects,
  registerProject,
  removeProject,
  startWatchers,
} from '../src/runtime.mjs';
import {STORE_DIR, onboardingPreferences} from '../src/store.mjs';

const VERSION = '0.1.8';
const DASHBOARD_URL = 'https://kitcode.onedigitas.com/';
const TRACKER_PATH = path.join(STORE_DIR, 'tracker.json');
const require = createRequire(import.meta.url);
let activeTerminalProcess = null;
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const COLOR = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  primary: '\x1b[31m',
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
  ) ? 'help' : firstArg;
  const options = {
    command,
    subcommand: argv[3],
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    rewardSeconds: undefined,
    rewardEquals: undefined,
    source: undefined,
    tier: undefined,
    openPet: false,
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
    } else if (arg === '--pet') {
      options.openPet = true;
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
  add [path]            Add a project to KitCode, default current directory
  remove [path]         Remove a project and its contribution data
  track                 Start the KitCode tracker in the background
  untrack               Stop the KitCode tracker
  list                  Show added project totals
  status                Show tracker, project, and reward progress
  summary               Show compact =, active time, and milestone progress
  awards                Show reward and milestone readiness
  dashboard             Open the dashboard for the running tracker
  terminal              Open the safe KitCode terminal window and view modes
  pet                   Open the independent desktop pet companion
  setup                 Open KitCode preferences and onboarding
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
  --pet                 Show the independent pet companion alongside Terminal
  -v, --version         Print version
  -h, --help            Print help
`);
}

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function milestoneProgress(reward, milestone) {
  if (!milestone) {
    return 1;
  }

  const timeProgress = milestone.requiredSeconds > 0
    ? reward.earnedSeconds / milestone.requiredSeconds
    : 1;
  const equalsProgress = milestone.requiredEquals > 0
    ? reward.totalEquals / milestone.requiredEquals
    : 1;

  return Math.min(1, Math.max(0, Math.min(timeProgress, equalsProgress)));
}

function nextMilestone(reward) {
  return reward.milestones.find((milestone) => (
    !milestone.redeemed &&
    milestone.status !== 'ready' &&
    milestone.status !== 'redeemed' &&
    !milestone.unlocked
  )) ?? reward.milestones.find((milestone) => !milestone.redeemed && milestone.status === 'locked') ?? null;
}

function printRewardSummary() {
  const reward = getDiskRewardSummary();
  const finalMilestone = reward.milestones.at(-1);
  const next = nextMilestone(reward);
  const ready = reward.milestones.filter((milestone) => milestone.status === 'ready' && !milestone.redeemed);
  const totalProgress = finalMilestone
    ? Math.round(milestoneProgress(reward, finalMilestone) * 100)
    : Math.round((reward.progress ?? 0) * 100);

  console.log('KitCode summary');
  console.log(`  = counted: ${reward.totalEquals}`);
  console.log(`  active time: ${formatDuration(reward.earnedSeconds)}`);
  console.log(`  campaign progress: ${totalProgress}%`);

  if (ready.length > 0) {
    console.log(`  ready: ${ready.map((milestone) => `${milestone.percent}%`).join(', ')}`);
    return;
  }

  if (next) {
    const progress = Math.round(milestoneProgress(reward, next) * 100);
    const equalsLeft = Math.max(0, next.requiredEquals - reward.totalEquals);
    const secondsLeft = Math.max(0, next.requiredSeconds - reward.earnedSeconds);
    console.log(`  next milestone: ${next.percent}% (${progress}% there)`);
    console.log(`  left: ${equalsLeft} =, ${formatDuration(secondsLeft)}`);
  }
}

function printAwards() {
  const reward = getDiskRewardSummary();

  console.log('KitCode awards');
  for (const milestone of reward.milestones) {
    const label = milestone.rewardBacked ? 'reward' : 'milestone';
    const progress = Math.round(milestoneProgress(reward, milestone) * 100);
    console.log(`  ${milestone.percent}% ${label}: ${milestone.status} (${progress}%)`);
  }
}

async function printStatus(options) {
  const totals = listProjects();
  const running = await isServerRunning(options);

  console.log('KitCode status');
  console.log(`  tracker: ${running ? 'running' : 'stopped'}`);
  console.log(`  added projects: ${totals.trackingProjects}`);
  printRewardSummary();
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
      windowsHide: true,
    });

    child.on('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function terminalUrl(options) {
  return `http://${options.host}:${options.port}/terminal`;
}

function openTerminalWindow(options, lifecycle = {}) {
  const url = terminalUrl(options);

  try {
    const electronPath = require('electron');
    const entryPath = path.resolve(fileURLToPath(new URL('../src/terminal-electron.mjs', import.meta.url)));
    const child = spawn(electronPath, [entryPath], {
      detached: true,
      env: {
        ...process.env,
        KITCODE_TERMINAL_URL: url,
      },
      stdio: 'ignore',
      windowsHide: true,
    });

    activeTerminalProcess = child;
    child.on('error', () => openDashboard(url));
    child.on('exit', () => {
      if (activeTerminalProcess === child) {
        activeTerminalProcess = null;
      }

      lifecycle.onExit?.();
    });
    child.unref();
    return true;
  } catch {
    console.log(colorize('Electron is not installed. Opening the terminal view in your browser instead.', COLOR.yellow));
  }

  return openDashboard(url);
}

function openElectronEntry(entryName, environment = {}) {
  try {
    const electronPath = require('electron');
    const entryPath = path.resolve(fileURLToPath(new URL(`../src/${entryName}`, import.meta.url)));
    const child = spawn(electronPath, [entryPath], {
      detached: true,
      env: {...process.env, KITCODE_NODE_PATH: process.execPath, KITCODE_CLI_ENTRY: fileURLToPath(import.meta.url), ...environment},
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function openOnboardingWindow(options) {
  if (openElectronEntry('onboarding-electron.mjs', {KITCODE_HOST: options.host, KITCODE_PORT: String(options.port)})) {
    return true;
  }
  console.error('KitCode setup needs Electron for the desktop folder picker. Install the optional Electron dependency and run `kitcode setup` again.');
  return false;
}

function openCompanionWindow(options, view) {
  if (openElectronEntry('companion-electron.mjs', {
    KITCODE_HOST: options.host,
    KITCODE_PORT: String(options.port),
    KITCODE_COMPANION_VIEW: view,
  })) {
    return true;
  }
  console.error('KitCode companion needs Electron. Open `kitcode dashboard` instead.');
  return false;
}

function printDashboardHint(options) {
  console.log(`${colorize('Dashboard', COLOR.bold)}: ${colorize(DASHBOARD_URL, COLOR.cyan, COLOR.underline)}`);

  if (!options.openDashboard) {
    console.log(colorize('Open dashboard manually when you are ready.', COLOR.dim));
    return;
  }

  console.log(colorize('Opening dashboard in your browser...', COLOR.primary));

  if (!openDashboard(DASHBOARD_URL)) {
    console.log(colorize('Could not open the browser automatically. Paste the dashboard URL above.', COLOR.yellow));
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
    if (!onboardingPreferences().completed) {
      console.log('Opening KitCode Welcome...');
      openOnboardingWindow({host: DEFAULT_HOST, port: DEFAULT_PORT});
    }
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

function readTrackerMetadata() {
  try {
    if (!fs.existsSync(TRACKER_PATH)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function writeTrackerMetadata(options) {
  fs.mkdirSync(STORE_DIR, {recursive: true});
  fs.writeFileSync(TRACKER_PATH, `${JSON.stringify({
    pid: process.pid,
    host: options.host,
    port: options.port,
    startedAt: new Date().toISOString(),
  }, null, 2)}\n`);
}

function removeTrackerMetadata() {
  try {
    fs.rmSync(TRACKER_PATH, {force: true});
  } catch {}
}

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printTrackerNotRunning() {
  console.error('KitCode tracker is not running. Run `kitcode track` first.');
}

function runDaemon(options, status = createStatusReporter()) {
  status.set('Starting KitCode tracker...');
  const runtime = createRuntime(options);
  const app = createServer(runtime, VERSION);
  let cleanup = () => {};
  let server = null;

  cleanup = startWatchers(runtime, {
    onProgress(message) {
      status.set(message);
    },
  });

  const shutdown = () => {
    cleanup();
    removeTrackerMetadata();

    if (!server) {
      process.exit(0);
      return;
    }

    server.closeAllConnections?.();
    server.close(() => process.exit(0));
  };

  server = app.listen(options.port, options.host, () => {
    status.stop();
    writeTrackerMetadata(options);
  });

  server.on('error', (error) => {
    status.stop();
    cleanup();
    removeTrackerMetadata();

    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${options.port} is already in use. Stop the other server or pass --port <port>.`);
      process.exit(1);
    }

    console.error(error.message);
    process.exit(1);
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

async function startTracker(options) {
  if (await isServerRunning(options)) {
    console.log('KitCode tracker is already running.');
    console.log(`Local server: http://${options.host}:${options.port}`);
    return;
  }

  const metadata = readTrackerMetadata();

  if (metadata && !isProcessRunning(Number(metadata.pid))) {
    removeTrackerMetadata();
  }

  const child = spawn(process.execPath, [
    fileURLToPath(import.meta.url),
    'track',
    '--host',
    options.host,
    '--port',
    String(options.port),
  ], {
    detached: true,
    env: {
      ...process.env,
      KITCODE_DAEMON: '1',
      KITCODE_NO_OPEN: '1',
      NO_COLOR: process.env.NO_COLOR ?? '1',
    },
    stdio: 'ignore',
    windowsHide: true,
  });

  child.unref();

  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (await isServerRunning(options)) {
      console.log('KitCode tracker started.');
      console.log(`Local server: http://${options.host}:${options.port}`);
      return;
    }

    await sleep(200);
  }

  console.error('KitCode tracker did not start. Try running `kitcode track` again.');
  process.exit(1);
}

async function stopTracker(options) {
  const metadata = readTrackerMetadata();

  if (!metadata || !isProcessRunning(Number(metadata.pid))) {
    removeTrackerMetadata();
    console.log('KitCode tracker is not running.');
    return;
  }

  try {
    process.kill(Number(metadata.pid), 'SIGTERM');
  } catch {
    removeTrackerMetadata();
    console.log('KitCode tracker is not running.');
    return;
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (!isProcessRunning(Number(metadata.pid)) || !(await isServerRunning(options))) {
      removeTrackerMetadata();
      console.log('KitCode tracker stopped.');
      return;
    }

    await sleep(200);
  }

  console.log('KitCode tracker stop requested.');
}

const options = parseArgs(process.argv);

if (options.command === 'track' && process.env.KITCODE_DAEMON === '1') {
  runDaemon(options);
} else if (options.command === 'dashboard') {
  const status = createStatusReporter();
  status.set('Checking local server...');

  if (await isServerRunning(options)) {
    status.stop();
    console.log(`${colorize('KitCode', COLOR.bold, COLOR.primary)} is already live.`);
    printDashboardHint(options);
  } else {
    status.stop();
    printTrackerNotRunning();
    process.exit(1);
  }
} else if (options.command === 'terminal' || options.command === 'pet') {
  const status = createStatusReporter();
  status.set('Checking local server...');

  if (await isServerRunning(options)) {
    status.stop();
    const openPet = options.command === 'pet' || options.openPet;
    console.log(`${colorize(openPet ? 'KitCode Pet' : 'KitCode Terminal', COLOR.bold, COLOR.primary)} is opening.`);
    if (openPet) {
      openCompanionWindow(options, 'pet');
      if (options.command === 'terminal') openTerminalWindow(options);
    } else {
      console.log(`${colorize('Terminal window', COLOR.bold)}: ${colorize(terminalUrl(options), COLOR.cyan, COLOR.underline)}`);
      openTerminalWindow(options);
    }
  } else {
    status.stop();
    printTrackerNotRunning();
    process.exit(1);
  }
} else if (options.command === 'add') {
  const totals = registerProject(process.argv[3] ?? '.');
  console.log('Project added to KitCode.');
  console.log(`Added projects: ${totals.trackingProjects}`);
} else if (options.command === 'remove') {
  const targetPath = process.argv[3] ?? '.';
  const totals = removeProject(targetPath);

  if (!totals) {
    console.error('Folder not found.');
    process.exit(1);
  }

  console.log('Project removed from KitCode.');
  console.log(`Added projects: ${totals.trackingProjects}`);
} else if (options.command === 'track') {
  await startTracker(options);
} else if (options.command === 'list') {
  const totals = listProjects();

  if (totals.trackingProjects === 0) {
    console.log('No added projects. Run: kitcode add');
  } else {
    console.log(`Added projects: ${totals.trackingProjects}`);
  }
} else if (options.command === 'status') {
  await printStatus(options);
} else if (options.command === 'summary') {
  printRewardSummary();
} else if (options.command === 'awards' || options.command === 'award' || options.command === 'rewards') {
  printAwards();
} else if (options.command === 'untrack') {
  await stopTracker(options);
} else if (options.command === 'setup') {
  openOnboardingWindow(options);
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
