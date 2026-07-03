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

function fileKeyForRelative(relativePath) {
  return hashValue(relativePath);
}

export function shouldIgnoreRelativePath(relativePath) {
  return relativePath
    .split(/[\\/]+/)
    .some((part) => IGNORED_DIRS.has(part));
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

function lineCountsChanged(previousCounts = {}, nextCounts = {}) {
  const keys = new Set([
    ...Object.keys(previousCounts),
    ...Object.keys(nextCounts),
  ]);

  for (const key of keys) {
    if ((previousCounts[key] ?? 0) !== (nextCounts[key] ?? 0)) {
      return true;
    }
  }

  return false;
}

function countAddedEquals(previousCounts, equalsByHash, lineCounts) {
  let equalsAdded = 0;

  for (const [lineHash, currentCount] of Object.entries(lineCounts)) {
    const delta = currentCount - (previousCounts[lineHash] ?? 0);

    if (delta > 0) {
      equalsAdded += delta * (equalsByHash[lineHash] ?? 0);
    }
  }

  return equalsAdded;
}

function readSourceFile(root, filePath) {
  const relativePath = safeRelative(root, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || shouldIgnoreRelativePath(relativePath)) {
    return null;
  }

  const source = readTextFile(filePath);

  if (source === null) {
    return {
      fileKey: fileKeyForRelative(relativePath),
      source: null,
    };
  }

  return {
    fileKey: fileKeyForRelative(relativePath),
    source,
  };
}

function readSourceFiles(root) {
  const sourceFiles = [];
  for (const filePath of walkFiles(root)) {
    const sourceFile = readSourceFile(root, filePath);

    if (sourceFile && sourceFile.source !== null) {
      sourceFiles.push(sourceFile);
    }
  }

  return sourceFiles;
}

function normalizeSnapshot(snapshot = {files: {}}) {
  return {
    version: 1,
    files: snapshot.files && typeof snapshot.files === 'object' ? snapshot.files : {},
  };
}

export function createSourceSnapshot(root) {
  const files = {};

  for (const {fileKey, source} of readSourceFiles(root)) {
    files[fileKey] = {
      lineCounts: lineCountsForSource(source).lineCounts,
    };
  }

  return {version: 1, files};
}

export function scanSourceChanges(root, previousSnapshot = {files: {}}, options = {}) {
  const previous = normalizeSnapshot(previousSnapshot);
  const changedPaths = Array.isArray(options.changedPaths) ? options.changedPaths : null;
  const nextSnapshot = changedPaths ? {version: 1, files: {...previous.files}} : {version: 1, files: {}};
  const processedFileKeys = new Set();
  let equalsAdded = 0;
  let changedFiles = 0;

  const sourceFiles = changedPaths
    ? changedPaths.map((changedPath) => readSourceFile(root, path.resolve(root, changedPath))).filter(Boolean)
    : readSourceFiles(root);

  for (const {fileKey, source} of sourceFiles) {
    processedFileKeys.add(fileKey);
    const previousCounts = previous.files[fileKey]?.lineCounts ?? {};

    if (source === null) {
      if (previous.files[fileKey]) {
        delete nextSnapshot.files[fileKey];
        changedFiles += 1;
      }
      continue;
    }

    const {equalsByHash, lineCounts} = lineCountsForSource(source);

    nextSnapshot.files[fileKey] = {lineCounts};
    equalsAdded += countAddedEquals(previousCounts, equalsByHash, lineCounts);

    if (lineCountsChanged(previousCounts, lineCounts)) {
      changedFiles += 1;
    }
  }

  if (!changedPaths) {
    for (const fileKey of Object.keys(previous.files)) {
      if (!processedFileKeys.has(fileKey)) {
        changedFiles += 1;
      }
    }
  }

  return {
    changedFiles,
    equalsAdded,
    snapshot: nextSnapshot,
  };
}
