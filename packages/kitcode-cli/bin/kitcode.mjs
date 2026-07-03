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
import {STORE_DIR} from '../src/store.mjs';

const VERSION = '0.1.8';
const DASHBOARD_URL = 'https://kitcode.onedigitas.com/';
const TRACKER_PATH = path.join(STORE_DIR, 'tracker.json');
const require = createRequire(import.meta.url);
let activeMiniProcess = null;
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
  add [path]            Add a project to KitCode, default current directory
  remove [path]         Remove a project and its contribution data
  track                 Start the KitCode tracker in the background
  untrack               Stop the KitCode tracker
  list                  Show added project totals
  dashboard             Open the dashboard for the running tracker
  mini                  Open the mini window for the running tracker
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

function miniUrl(options) {
  return `http://${options.host}:${options.port}/mini`;
}

function openMiniWindow(options, lifecycle = {}) {
  const url = miniUrl(options);

  try {
    const electronPath = require('electron');
    const entryPath = path.resolve(fileURLToPath(new URL('../src/mini-electron.mjs', import.meta.url)));
    const child = spawn(electronPath, [entryPath], {
      detached: true,
      env: {
        ...process.env,
        KITCODE_MINI_URL: url,
      },
      stdio: 'ignore',
    });

    activeMiniProcess = child;
    child.on('error', () => openDashboard(url));
    child.on('exit', () => {
      if (activeMiniProcess === child) {
        activeMiniProcess = null;
      }

      lifecycle.onExit?.();
    });
    child.unref();
    return true;
  } catch {
    console.log(colorize('Electron is not installed. Opening the mini view in your browser instead.', COLOR.yellow));
  }

  return openDashboard(url);
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
    console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is already live.`);
    printDashboardHint(options);
  } else {
    status.stop();
    printTrackerNotRunning();
    process.exit(1);
  }
} else if (options.command === 'mini') {
  const status = createStatusReporter();
  status.set('Checking local server...');

  if (await isServerRunning(options)) {
    status.stop();
    console.log(`${colorize('KitCode Mini', COLOR.bold, COLOR.green)} is opening.`);
    console.log(`${colorize('Mini window', COLOR.bold)}: ${colorize(miniUrl(options), COLOR.cyan, COLOR.underline)}`);
    openMiniWindow(options);
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
} else if (options.command === 'untrack') {
  await stopTracker(options);
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
