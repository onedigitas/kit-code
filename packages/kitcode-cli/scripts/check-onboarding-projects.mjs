import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kitcode-onboarding-'));
const homeDir = path.join(tempRoot, 'home');
const firstProject = path.join(tempRoot, 'first-project');
const secondProject = path.join(tempRoot, 'second-project');
const thirdProject = path.join(tempRoot, 'third-project');
const statePath = path.join(homeDir, '.kitcode/state.json');

process.env.HOME = homeDir;
process.env.USERPROFILE = homeDir;
fs.mkdirSync(homeDir, {recursive: true});

for (const [project, source] of [
  [firstProject, 'const first = 1;\n'],
  [secondProject, 'const second = 2;\n'],
  [thirdProject, 'const third = 3;\n'],
]) {
  fs.mkdirSync(project, {recursive: true});
  fs.writeFileSync(path.join(project, 'index.js'), source);
}

const runtime = await import('../src/runtime.mjs?onboarding-project-check');
runtime.registerProject(firstProject);
runtime.registerProject(secondProject);

const seededState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const firstEntry = Object.entries(seededState.projects).find(([, project]) => project.repoRoot === firstProject);
assert.ok(firstEntry, 'Expected the first project to be registered');
const [firstId, firstRecord] = firstEntry;
firstRecord.activeSeconds = 47;
firstRecord.changeBatchCount = 3;
seededState.equalsLedger = {
  total_equals: 9,
  projects: {
    [firstId]: {
      project_id: firstId,
      repo_root: firstProject,
      source_type: 'vibe',
      total_equals: 9,
      counted_commits: {},
      counted_batches: {fixture: {equals: 9, counted_at: '2026-07-13T00:00:00.000Z'}},
      first_counted_at: '2026-07-13T00:00:00.000Z',
      last_updated_at: '2026-07-13T00:00:00.000Z',
    },
  },
  earned_tiers: [],
  first_counted_at: '2026-07-13T00:00:00.000Z',
  last_updated_at: '2026-07-13T00:00:00.000Z',
};
fs.writeFileSync(statePath, JSON.stringify(seededState, null, 2) + '\n');

const before = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const result = runtime.registerNewProjects([firstProject, thirdProject, thirdProject]);
const after = JSON.parse(fs.readFileSync(statePath, 'utf8'));

assert.equal(result.addedProjects.length, 1, 'Only the genuinely new project should be registered');
assert.equal(result.addedProjects[0].repoRoot, thirdProject);
assert.equal(result.projects.length, 3, 'Initial state metadata must describe every registered project');
assert.equal(after.projects[firstId].activeSeconds, 47, 'Existing activity must survive onboarding save');
assert.equal(after.projects[firstId].changeBatchCount, 3, 'Existing change totals must survive onboarding save');
assert.deepEqual(after.projects[firstId].sourceSnapshot, before.projects[firstId].sourceSnapshot, 'Existing baseline must not be refreshed');
assert.deepEqual(after.equalsLedger, before.equalsLedger, 'Existing equals ledger must survive onboarding save');
assert.equal(runtime.describeProjects([thirdProject, thirdProject]).length, 1, 'Repeated selections must deduplicate by project identity');
assert.equal(runtime.listProjectRecords().length, 3, 'Reopened setup must list all registered projects');

fs.rmSync(tempRoot, {recursive: true, force: true});
console.log('Onboarding multi-project state checks passed.');
