import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';

const COMMIT_LIMIT = 30;

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
    throw new Error('Not inside a git repository. Run `kitcode serve` from a project repo.');
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

export function parseCommits(repoRoot) {
  try {
    const output = runGit(repoRoot, [
      'log',
      `--max-count=${COMMIT_LIMIT}`,
      '--format=%H%x1f%h%x1f%an%x1f%ae%x1f%ct%x1f%s',
    ]);

    if (!output) {
      return [];
    }

    return output.split('\n').map((line) => {
      const [hash, shortHash, authorName, authorEmail, timestamp, message] = line.split('\x1f');

      return {
        hash,
        shortHash,
        authorName,
        authorEmail,
        message,
        committedAt: new Date(Number(timestamp) * 1000).toISOString(),
      };
    });
  } catch {
    return [];
  }
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
