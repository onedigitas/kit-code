import {strict as assert} from 'node:assert';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/project-gateway.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(source, /SETUP_TABS|setupTab|NEWBIE DEVS|HARDCORE DEVS/);
assert.match(source, /Hello, I'm KitCode/);
assert.match(source, /Node\.js 20\+ is required/);
assert.match(source, /ask for my confirmation before installing or upgrading it/);
assert.match(source, /kitCodeCommand\(`\$\{agent\} on`\)/);
assert.match(source, /KitCode Welcome window/);
assert.match(source, /Do not manually edit KitCode state or calculate rewards/);
console.log('Project gateway setup checks passed.');
