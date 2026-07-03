import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {strict as assert} from 'node:assert';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kitcode-ledger-'));
const homeDir = path.join(tempRoot, 'home');
process.env.HOME = homeDir;
process.env.USERPROFILE = homeDir;

const {
  addSourceEqualsOnce,
  loadEqualsLedger,
  removeProjectEquals,
} = await import('../src/equals-ledger.mjs');
const {createSourceSnapshot} = await import('../src/source-snapshot.mjs');
const {refreshProject} = await import('../src/runtime.mjs');

const vibeA = {id: 'vibe-a', repoRoot: path.join(tempRoot, 'vibe-a'), sourceType: 'vibe'};
const vibeB = {id: 'vibe-b', repoRoot: path.join(tempRoot, 'vibe-b'), sourceType: 'vibe'};

addSourceEqualsOnce(vibeA, 'batch-a', 3);
addSourceEqualsOnce(vibeB, 'batch-b', 4);
addSourceEqualsOnce(vibeA, 'batch-a', 3);

{
  const ledger = loadEqualsLedger();

  assert.equal(ledger.total_equals, 7);
  assert.equal(ledger.projects[vibeA.id].total_equals, 3);
  assert.equal(ledger.projects[vibeB.id].total_equals, 4);
  assert.equal(ledger.projects[vibeA.id].counted_batches['batch-a'].equals, 3);
}

removeProjectEquals(vibeA.id);

{
  const ledger = loadEqualsLedger();

  assert.equal(ledger.total_equals, 4);
  assert.equal(ledger.projects[vibeA.id], undefined);
  assert.equal(ledger.projects[vibeB.id].total_equals, 4);
}

function hasGit() {
  try {
    execFileSync('git', ['--version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

if (hasGit()) {
  const repoRoot = path.join(tempRoot, 'git-project');
  fs.mkdirSync(repoRoot, {recursive: true});
  execFileSync('git', ['init'], {cwd: repoRoot, stdio: 'ignore'});
  execFileSync('git', ['config', 'user.email', 'kitcode@example.test'], {cwd: repoRoot});
  execFileSync('git', ['config', 'user.name', 'KitCode Test'], {cwd: repoRoot});
  fs.writeFileSync(path.join(repoRoot, 'index.js'), 'const answer = 42;\n');
  execFileSync('git', ['add', 'index.js'], {cwd: repoRoot});
  execFileSync('git', ['commit', '-m', 'Add answer'], {cwd: repoRoot, stdio: 'ignore'});

  const gitProject = {
    id: 'git-project',
    repoRoot,
    sourceType: 'git',
    commitCount: 0,
    changeBatchCount: 0,
    sourceSnapshot: createSourceSnapshot(repoRoot),
  };

  refreshProject(gitProject);

  {
    const ledger = loadEqualsLedger();

    assert.equal(gitProject.commitCount, 1);
    assert.equal(ledger.projects[gitProject.id], undefined);
    assert.equal(ledger.total_equals, 4);
  }

  fs.appendFileSync(path.join(repoRoot, 'index.js'), 'const next = answer + 1;\n');
  refreshProject(gitProject);

  {
    const ledger = loadEqualsLedger();

    assert.equal(gitProject.commitCount, 1);
    assert.equal(ledger.projects[gitProject.id].total_equals, 1);
    assert.equal(Object.keys(ledger.projects[gitProject.id].counted_batches).length, 1);
    assert.equal(Object.keys(ledger.projects[gitProject.id].counted_commits).length, 0);
    assert.equal(ledger.total_equals, 5);
  }
}

console.log('Project ledger checks passed.');
