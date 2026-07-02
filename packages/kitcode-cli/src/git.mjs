import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';

export function runGit(repoRoot, args) {
  return execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function isRealCodeLine(line) {
  const wordChars = line.match(/[A-Za-z0-9_]/g)?.length ?? 0;

  return wordChars >= 4 && wordChars > line.length * 0.4;
}

function countEquals(line) {
  return line.match(/=/g)?.length ?? 0;
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

export function resolveHeadCommit(repoRoot) {
  return {
    commitHash: runGit(repoRoot, ['rev-parse', 'HEAD']),
    repoRoot: runGit(repoRoot, ['rev-parse', '--show-toplevel']),
  };
}

export function countEqualsInHead(repoRoot, resolvedHead = null) {
  try {
    const head = resolvedHead ?? resolveHeadCommit(repoRoot);
    const diff = runGit(head.repoRoot, ['show', 'HEAD', '--format=', '--unified=0']);
    let equals = 0;

    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith('+') || line.startsWith('+++')) {
        continue;
      }

      const sourceLine = line.slice(1);

      if (isRealCodeLine(sourceLine)) {
        equals += countEquals(sourceLine);
      }
    }

    return equals;
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
