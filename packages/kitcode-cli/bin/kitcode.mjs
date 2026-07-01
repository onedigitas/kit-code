#!/usr/bin/env node

import {spawn} from 'node:child_process';
import process from 'node:process';
import {createServer} from '../src/api.mjs';
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

const VERSION = '0.1.0';
const DASHBOARD_URL = 'https://kitcode.vercel.app/';
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
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    rewardSeconds: DEFAULT_REWARD_SECONDS,
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

Options:
  --host <host>         Host to bind, default ${DEFAULT_HOST}
  --port <port>         Port to bind, default ${DEFAULT_PORT}
  --reward-seconds <n>  Reward target, default ${DEFAULT_REWARD_SECONDS}
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

function serve(options) {
  const runtime = createRuntime(options);
  const app = createServer(runtime, VERSION);
  const cleanup = startWatchers(runtime);
  const server = app.listen(options.port, options.host, () => {
    printServerReady(options, runtime);
  });

  server.on('error', (error) => {
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
  const totals = registerProject('.');

  if (await isServerRunning(options)) {
    console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is on for this folder.`);
    console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is already live.`);
    console.log(`${colorize('Active folders', COLOR.bold)}: ${colorize(String(totals.trackingProjects), COLOR.green, COLOR.bold)}`);
    printDashboardHint(options);
  } else {
    console.log(`${colorize('KitCode', COLOR.bold, COLOR.green)} is on for this folder.`);
    serve(options);
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
} else if (options.command === 'version') {
  console.log(VERSION);
} else {
  printHelp();
  process.exit(options.command === 'help' || !options.command ? 0 : 1);
}
