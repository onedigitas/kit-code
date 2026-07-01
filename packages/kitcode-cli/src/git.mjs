import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';

const COUNT_EQUALS_COMMAND = String.raw`git show HEAD --format= --unified=0 | grep '^+' | grep -v '^+++' | sed 's/^.//' | awk '{w=gsub(/[A-Za-z0-9_]/,"&"); if(w>=4 && w>length($0)*0.4) print}' | grep -oE '=' | wc -l`;

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

export function countEqualsInHead(repoRoot) {
  try {
    resolveHeadCommit(repoRoot);

    return Number(execFileSync('sh', ['-c', `${COUNT_EQUALS_COMMAND} || true`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()) || 0;
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
