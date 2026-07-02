import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SRC_DIR = path.resolve('src');
const MAX_LINES = 600;
const CODE_EXTENSIONS = new Set(['.css', '.js', '.jsx', '.ts', '.tsx']);
const KEBAB_CASE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.d)?\.(?:css|js|jsx|ts|tsx)$/;

const failures = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
      continue;
    }

    if (entry.isFile() && CODE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function countLines(source) {
  if (source.length === 0) return 0;
  return source.endsWith('\n') ? source.split('\n').length - 1 : source.split('\n').length;
}

const files = await collectFiles(SRC_DIR);
const rewardProgressSource = await readFile(path.resolve(SRC_DIR, 'lib/reward-progress.ts'), 'utf8');

if (/MILESTONE_TIME_TARGETS|60,\s*180,\s*300,\s*600,\s*900/.test(rewardProgressSource)) {
  failures.push('src/lib/reward-progress.ts: dashboard must not hardcode milestone time targets');
}

for (const file of files) {
  const fileName = path.basename(file);
  const relativePath = path.relative(process.cwd(), file);

  if (!KEBAB_CASE_FILE.test(fileName)) {
    failures.push(`${relativePath}: filename must be lowercase kebab-case`);
  }

  const lineCount = countLines(await readFile(file, 'utf8'));

  if (lineCount > MAX_LINES) {
    failures.push(`${relativePath}: ${lineCount} lines exceeds ${MAX_LINES}`);
  }
}

if (failures.length > 0) {
  console.error('Project rules failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Project rules passed for ${files.length} src files.`);
