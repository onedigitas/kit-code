import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {strict as assert} from 'node:assert';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kitcode-source-'));
const projectRoot = path.join(tempRoot, 'project');
fs.mkdirSync(projectRoot, {recursive: true});

const {
  createSourceSnapshot,
  scanSourceChanges,
} = await import('../src/source-snapshot.mjs');

fs.writeFileSync(path.join(projectRoot, 'index.js'), 'const existing = 1;\n');

const baseline = createSourceSnapshot(projectRoot);
const unchanged = scanSourceChanges(projectRoot, baseline);

assert.equal(unchanged.equalsAdded, 0);
assert.equal(unchanged.changedFiles, 0);

fs.appendFileSync(path.join(projectRoot, 'index.js'), 'const next = existing + 1;\n');

const added = scanSourceChanges(projectRoot, baseline, {changedPaths: ['index.js']});

assert.equal(added.equalsAdded, 1);
assert.equal(added.changedFiles, 1);

fs.appendFileSync(path.join(projectRoot, 'index.js'), 'console.log(next);\n');

const noEquals = scanSourceChanges(projectRoot, added.snapshot, {changedPaths: ['index.js']});

assert.equal(noEquals.equalsAdded, 0);
assert.equal(noEquals.changedFiles, 1);

fs.writeFileSync(path.join(projectRoot, 'dupes.js'), [
  'const pair = 1;',
  'const pair = 1;',
  '',
].join('\n'));

const duplicate = scanSourceChanges(projectRoot, noEquals.snapshot, {changedPaths: ['dupes.js']});

assert.equal(duplicate.equalsAdded, 2);
assert.equal(duplicate.changedFiles, 1);

fs.unlinkSync(path.join(projectRoot, 'dupes.js'));

const deleted = scanSourceChanges(projectRoot, duplicate.snapshot, {changedPaths: ['dupes.js']});

assert.equal(deleted.equalsAdded, 0);
assert.equal(deleted.changedFiles, 1);

fs.mkdirSync(path.join(projectRoot, 'node_modules'), {recursive: true});
fs.writeFileSync(path.join(projectRoot, 'node_modules', 'ignored.js'), 'const ignored = 1;\n');

const ignored = scanSourceChanges(projectRoot, deleted.snapshot);

assert.equal(ignored.equalsAdded, 0);

const emptyRoot = path.join(tempRoot, 'empty-project');
fs.mkdirSync(emptyRoot, {recursive: true});
const emptyBaseline = createSourceSnapshot(emptyRoot);
fs.writeFileSync(path.join(emptyRoot, 'new.js'), 'const fresh = 1;\n');
const firstFile = scanSourceChanges(emptyRoot, emptyBaseline, {changedPaths: ['new.js']});

assert.equal(firstFile.equalsAdded, 1);
assert.equal(firstFile.changedFiles, 1);

console.log('Source snapshot checks passed.');
