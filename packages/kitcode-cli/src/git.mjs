import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';

export function runGit(repoRoot, args) {
  return execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

export function detectRepoRoot(cwd) {
  try {
    return execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    throw new Error('Not inside a git repository. Run `kitcode add` from a project repo.');
  }
}

export function tryDetectRepoRoot(cwd) {
  try {
    return detectRepoRoot(cwd);
  } catch {
    return null;
  }
}

export function readRemote(repoRoot) {
  try {
    return runGit(repoRoot, ['config', '--get', 'remote.origin.url']);
  } catch {
    return '';
  }
}

export function createProjectId(repoRoot) {
  return crypto.createHash('sha256').update(`${repoRoot}\n${readRemote(repoRoot)}`).digest('hex').slice(0, 16);
}

export function createFolderProjectId(folderRoot) {
  return crypto.createHash('sha256').update(`vibe\n${folderRoot}`).digest('hex').slice(0, 16);
}

export function countCommits(repoRoot) {
  try {
    return Number(runGit(repoRoot, ['rev-list', '--count', 'HEAD'])) || 0;
  } catch {
    return 0;
  }
}

export function getGitSignature(repoRoot) {
  try {
    const head = runGit(repoRoot, ['rev-parse', 'HEAD']);
    const status = runGit(repoRoot, ['status', '--porcelain=v1']);
    return `${head}\n${status}`;
  } catch {
    return `${Date.now()}`;
  }
}
