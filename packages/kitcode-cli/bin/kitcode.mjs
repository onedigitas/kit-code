#!/usr/bin/env node

import process from 'node:process';
import {createServer} from '../src/api.mjs';
import {createRuntime, DEFAULT_HOST, DEFAULT_PORT, DEFAULT_REWARD_SECONDS, startWatchers} from '../src/runtime.mjs';

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
    console.log(`Tracking project: ${runtime.state.projects[runtime.projectId].name}`);
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
} else if (options.command === 'version') {
  console.log(VERSION);
} else {
  printHelp();
  process.exit(options.command === 'help' || !options.command ? 0 : 1);
}
