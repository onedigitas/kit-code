import {strict as assert} from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PET_ATLAS} from '../src/pet-animations.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetDirectory = path.join(packageRoot, 'src/pet-assets/kit-terminal');
const manifestPath = path.join(assetDirectory, 'pet.json');
const spritesheetPath = path.join(assetDirectory, 'spritesheet.webp');
const repositoryRoot = path.resolve(packageRoot, '../..');
const qaEvidencePath = path.join(repositoryRoot, 'docs/images/pet/kit-terminal-qa.json');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function readUint24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString('ascii');
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (type === 'VP8X') {
      return {
        width: readUint24LE(buffer, dataOffset + 4) + 1,
        height: readUint24LE(buffer, dataOffset + 7) + 1,
      };
    }

    if (type === 'VP8L' && buffer[dataOffset] === 0x2f) {
      const bits = buffer.readUInt32LE(dataOffset + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    if (type === 'VP8 ' && buffer.subarray(dataOffset + 3, dataOffset + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    offset = dataOffset + size + (size % 2);
  }

  throw new Error('Unable to read WebP dimensions');
}

assert.ok(fs.existsSync(manifestPath), 'Kit Terminal pet manifest is missing');
assert.ok(fs.existsSync(spritesheetPath), 'Kit Terminal spritesheet is missing');
assert.ok(fs.existsSync(qaEvidencePath), 'Kit Terminal visual QA evidence is missing');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.equal(manifest.id, 'kit-terminal');
assert.equal(manifest.displayName, 'Kit Terminal');
assert.equal(manifest.spriteVersionNumber, 2);
assert.equal(manifest.spritesheetPath, 'spritesheet.webp');
assert.equal(manifest.primaryColor, '#fc0a0a');

const spritesheet = fs.readFileSync(spritesheetPath);
assert.ok(spritesheet.length > 1024, 'Kit Terminal spritesheet is unexpectedly small');
assert.deepEqual(webpDimensions(spritesheet), {
  width: PET_ATLAS.width,
  height: PET_ATLAS.height,
});

const qaEvidence = JSON.parse(fs.readFileSync(qaEvidencePath, 'utf8'));
assert.equal(qaEvidence.generator, 'hatch-pet-v2');
assert.equal(qaEvidence.asset.spriteVersionNumber, 2);
assert.equal(qaEvidence.asset.primaryColor, '#fc0a0a');
assert.equal(qaEvidence.asset.sha256, sha256(spritesheetPath));
assert.equal(qaEvidence.deterministicValidation.ok, true);
assert.deepEqual(qaEvidence.deterministicValidation.errors, []);
assert.equal(qaEvidence.deterministicValidation.despillOk, true);
assert.equal(qaEvidence.deterministicValidation.alphaPreserved, true);
assert.equal(qaEvidence.blindDirectionValidation.ok, true);
assert.deepEqual(qaEvidence.blindDirectionValidation.errors, []);
assert.deepEqual(qaEvidence.blindDirectionValidation.unconfirmed, []);
assert.equal(qaEvidence.directionSemantics.failCount, 0);
assert.equal(qaEvidence.finalVisualQA.verdict, 'pass');
for (const reference of Object.values(qaEvidence.references)) {
  assert.equal(reference.sha256, sha256(path.join(repositoryRoot, reference.path)));
}

const publishedSource = [
  fs.readFileSync(path.join(packageRoot, 'src/pet-window.mjs'), 'utf8'),
  fs.readFileSync(path.join(packageRoot, 'src/pet-electron.mjs'), 'utf8'),
  fs.readFileSync(path.join(packageRoot, 'src/pet-animations.mjs'), 'utf8'),
].join('\n');

assert.doesNotMatch(publishedSource, /\$CODEX_HOME|\.codex\/pets|imagegen-jobs|layout-guides/);
assert.ok(!fs.readdirSync(assetDirectory).some((name) => /prompt|decoded|frames|qa|job/i.test(name)));

console.log('Pet asset checks passed.');
