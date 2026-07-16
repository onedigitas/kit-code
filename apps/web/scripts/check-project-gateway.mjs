import {strict as assert} from 'node:assert';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/project-gateway.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(source, /SETUP_TABS|setupTab|NEWBIE DEVS|HARDCORE DEVS/);
assert.match(source, /Hello,<br \/>I/);
assert.match(source, /assistantSetupPromptFor\('codex'\)/);
assert.match(source, /assistantSetupPromptFor\('claude'\)/);
assert.match(source, /projects are chosen later in KitCode Welcome/);
console.log('Project gateway setup checks passed.');
