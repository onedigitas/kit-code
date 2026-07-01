#!/usr/bin/env node

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
  startWatchers,
} from '../src/runtime.mjs';

const VERSION = '0.1.0';

function parseArgs(argv) {
  const options = {
    command: argv[2],
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    rewardSeconds: DEFAULT_REWARD_SECONDS,
  };

  if (options.command === '--help' || options.command === '-h') {
    options.command = 'help';
  } else if (options.command === '--version' || options.command === '-v') {
    options.command = 'version';
  }

  for (let index = 3; index < argv.length; index += 1) {
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
  console.log(`Usage: kitcode <command> [options]

Commands:
  serve                 Start the local KitCode server
  add [path]            Register a git project, default current directory
  list                  List registered projects
  start                 Track all registered projects
  stop                  Stop tracking all registered projects
  remove [path]         Remove a registered project, default current directory

Options:
  --host <host>         Host to bind, default ${DEFAULT_HOST}
  --port <port>         Port to bind, default ${DEFAULT_PORT}
  --reward-seconds <n>  Reward target, default ${DEFAULT_REWARD_SECONDS}
  -v, --version         Print version
  -h, --help            Print help
`);
}

function serve(options) {
  const runtime = createRuntime(options);
  const app = createServer(runtime, VERSION);
  const cleanup = startWatchers(runtime);
  const server = app.listen(options.port, options.host, () => {
    console.log(`KitCode server running on http://${options.host}:${options.port}`);
    console.log(`Registered projects: ${Object.keys(runtime.state.projects).length}`);
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

if (options.command === 'serve') {
  serve(options);
} else if (options.command === 'add') {
  const totals = registerProject(process.argv[3] ?? '.');
  console.log('Project registered.');
  console.log(`Total projects: ${totals.totalProjects}`);
} else if (options.command === 'list') {
  const totals = listProjects();

  if (totals.totalProjects === 0) {
    console.log('No projects registered. Run: kitcode add .');
  } else {
    console.log(`Total projects: ${totals.totalProjects}`);
    console.log(`Tracking projects: ${totals.trackingProjects}`);
  }
} else if (options.command === 'start') {
  const totals = setAllProjectsActive(true);
  console.log('Tracking started.');
  console.log(`Total projects: ${totals.totalProjects}`);
  console.log(`Tracking projects: ${totals.trackingProjects}`);
} else if (options.command === 'stop') {
  const totals = setAllProjectsActive(false);
  console.log('Tracking stopped.');
  console.log(`Total projects: ${totals.totalProjects}`);
  console.log(`Tracking projects: ${totals.trackingProjects}`);
} else if (options.command === 'remove') {
  const targetPath = process.argv[3] ?? '.';
  const totals = removeProject(targetPath);

  if (!totals) {
    console.error('Project not found.');
    process.exit(1);
  }

  console.log('Project removed.');
  console.log(`Total projects: ${totals.totalProjects}`);
} else if (options.command === 'version') {
  console.log(VERSION);
} else {
  printHelp();
  process.exit(options.command === 'help' || !options.command ? 0 : 1);
}
