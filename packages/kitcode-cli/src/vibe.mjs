import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'out',
  'coverage',
]);
const MAX_FILE_BYTES = 1024 * 1024;

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function isRealCodeLine(line) {
  const wordChars = line.match(/[A-Za-z0-9_]/g)?.length ?? 0;

  return wordChars >= 4 && wordChars > line.length * 0.4;
}

function countEquals(line) {
  return line.match(/=/g)?.length ?? 0;
}

function isBinary(buffer) {
  return buffer.includes(0);
}

function safeRelative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function walkFiles(root, current = root, files = []) {
  let entries = [];

  try {
    entries = fs.readdirSync(current, {withFileTypes: true});
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walkFiles(root, fullPath, files);
      }
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function readTextFile(filePath) {
  let stat;

  try {
    stat = fs.statSync(filePath);
  } catch {
    return null;
  }

  if (!stat.isFile() || stat.size > MAX_FILE_BYTES) {
    return null;
  }

  try {
    const buffer = fs.readFileSync(filePath);

    if (isBinary(buffer)) {
      return null;
    }

    return buffer.toString('utf8');
  } catch {
    return null;
  }
}

function lineCountsForSource(source) {
  const lineCounts = {};
  const equalsByHash = {};

  for (const line of source.split(/\r?\n/)) {
    if (!isRealCodeLine(line)) {
      continue;
    }

    const lineHash = hashValue(line);
    lineCounts[lineHash] = (lineCounts[lineHash] ?? 0) + 1;
    equalsByHash[lineHash] ??= countEquals(line);
  }

  return {equalsByHash, lineCounts};
}

export function createVibeSnapshot(root) {
  const files = {};

  for (const filePath of walkFiles(root)) {
    const source = readTextFile(filePath);

    if (source === null) {
      continue;
    }

    const fileKey = hashValue(safeRelative(root, filePath));
    files[fileKey] = {
      lineCounts: lineCountsForSource(source).lineCounts,
    };
  }

  return {files};
}

export function scanVibeChanges(root, previousSnapshot = {files: {}}) {
  const nextSnapshot = createVibeSnapshot(root);
  let equalsAdded = 0;
  let changedFiles = 0;

  for (const filePath of walkFiles(root)) {
    const source = readTextFile(filePath);

    if (source === null) {
      continue;
    }

    const fileKey = hashValue(safeRelative(root, filePath));
    const previousCounts = previousSnapshot.files?.[fileKey]?.lineCounts ?? {};
    const {equalsByHash, lineCounts} = lineCountsForSource(source);
    let fileChanged = false;

    for (const [lineHash, currentCount] of Object.entries(lineCounts)) {
      const delta = currentCount - (previousCounts[lineHash] ?? 0);

      if (delta > 0) {
        equalsAdded += delta * (equalsByHash[lineHash] ?? 0);
        fileChanged = true;
      }
    }

    if (fileChanged) {
      changedFiles += 1;
    }
  }

  return {
    changedFiles,
    equalsAdded,
    snapshot: nextSnapshot,
  };
}
