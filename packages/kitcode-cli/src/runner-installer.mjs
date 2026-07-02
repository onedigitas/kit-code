import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {CLI_PACKAGE_NAME, RUNNER_PATH_PARTS} from './integration-spec.mjs';

function packageRoot() {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

export function runnerPath() {
  return path.join(os.homedir(), ...RUNNER_PATH_PARTS);
}

function runnerScript() {
  const binPath = path.join(packageRoot(), 'bin', 'kitcode.mjs');

  return [
    '#!/bin/sh',
    `if [ -f ${JSON.stringify(binPath)} ]; then`,
    `  exec ${JSON.stringify(process.execPath)} ${JSON.stringify(binPath)} "$@"`,
    'fi',
    `exec npx -y ${CLI_PACKAGE_NAME} "$@"`,
    '',
  ].join('\n');
}

function runnerCmdScript() {
  const binPath = path.join(packageRoot(), 'bin', 'kitcode.mjs');

  return [
    '@echo off',
    `if exist "${binPath}" (`,
    `  "${process.execPath}" "${binPath}" %*`,
    ') else (',
    `  npx -y ${CLI_PACKAGE_NAME} %*`,
    ')',
    '',
  ].join('\r\n');
}

export function installRunner() {
  const filePath = runnerPath();

  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, runnerScript());
  fs.chmodSync(filePath, 0o755);
  fs.writeFileSync(`${filePath}.cmd`, runnerCmdScript());

  return {
    installed: true,
    path: filePath,
  };
}

export function runnerStatus() {
  const filePath = runnerPath();

  return {
    installed: fs.existsSync(filePath),
    path: filePath,
  };
}
