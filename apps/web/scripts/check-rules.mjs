import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.resolve('src');
const MAX_LINES = 600;
const CODE_EXTENSIONS = new Set(['.css', '.js', '.jsx', '.ts', '.tsx']);
const KEBAB_CASE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.d)?\.(?:css|js|jsx|ts|tsx)$/;
const PRIMARY_RED = '#fc0a0a';
const OLD_PRIMARY_PATTERNS = [
  /#8BC34A/i,
  /#b6f26b/i,
  /#b7f36c/i,
  /rgba\(\s*139\s*,\s*195\s*,\s*74\b/i,
  /rgb\(\s*139\s*,\s*195\s*,\s*74\b/i,
  /#4F7E5D/i,
  /#071006/i,
  /#14200f/i,
  /#10180d/i,
  /#06171c/i,
  /#050805/i,
  /brand-matcha/i,
  /color-brand-matcha/i,
  /reward-green-pack/i,
  /style:\s*'green'/i,
  /Green neon/i,
];
const BRAND_SURFACE_FILES = [
  'src/index.css',
  'src/app.tsx',
  'src/components/activity-dashboard.tsx',
  'src/components/admin-page.tsx',
  'src/components/project-gateway.tsx',
  'src/components/registration-form.tsx',
  'src/components/sidebar.tsx',
  'src/components/symbol-stream.tsx',
  'src/lib/reward-progress.ts',
  'index.html',
  'public/favicon.svg',
  'public/og-image.svg',
  'public/site.webmanifest',
];
const PRIMARY_BACKGROUND_COLORS = [
  '#050705',
  '#090303',
  '#100606',
  '#170506',
  '#170b0b',
  '#0c0c0c',
  '#111111',
];
const MIN_TEXT_CONTRAST = 4.5;

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

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function channelToLinear(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const [red, green, blue] = hexToRgb(hex).map(channelToLinear);
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

const files = await collectFiles(SRC_DIR);
const rewardProgressSource = await readFile(path.resolve(SRC_DIR, 'lib/reward-progress.ts'), 'utf8');
const indexCssSource = await readFile(path.resolve(SRC_DIR, 'index.css'), 'utf8');

if (/MILESTONE_TIME_TARGETS|60,\s*180,\s*300,\s*600,\s*900/.test(rewardProgressSource)) {
  failures.push('src/lib/reward-progress.ts: dashboard must not hardcode milestone time targets');
}

if (!indexCssSource.includes(`--color-brand-primary: ${PRIMARY_RED};`)) {
  failures.push(`src/index.css: primary brand token must use ${PRIMARY_RED}`);
}

for (const relativeFile of BRAND_SURFACE_FILES) {
  const source = await readFile(path.resolve(ROOT_DIR, relativeFile), 'utf8');

  for (const pattern of OLD_PRIMARY_PATTERNS) {
    if (pattern.test(source)) {
      failures.push(`${relativeFile}: old primary color remains (${pattern})`);
    }
  }
}

for (const background of PRIMARY_BACKGROUND_COLORS) {
  const ratio = contrastRatio(PRIMARY_RED, background);

  if (ratio < MIN_TEXT_CONTRAST) {
    failures.push(`primary red contrast on ${background} is ${ratio.toFixed(2)}, below ${MIN_TEXT_CONTRAST}`);
  }
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
