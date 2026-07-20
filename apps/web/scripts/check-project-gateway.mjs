import {strict as assert} from 'node:assert';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/project-gateway.tsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/gateway.css', import.meta.url), 'utf8');
const scatter = fs.readFileSync(new URL('../src/components/gateway-session-log-scatter.tsx', import.meta.url), 'utf8');
const tokens = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

assert.doesNotMatch(source, /SETUP_TABS|setupTab|NEWBIE DEVS|HARDCORE DEVS/);
assert.doesNotMatch(source, /Hello,<br \/>I|gateway-features|WATCH KITCODE VIDEO|humans:/);
assert.match(source, /SESSION LOG/);
assert.match(source, /Introducing/);
assert.match(source, /KitCode\./);
assert.match(source, /THE LIFE AND TIMES OF A DEV EARNING BREAKS/);
assert.match(source, /ALL RIGHTS RESERVED/);
assert.match(source, /WHO MADE THIS\?/);
assert.match(source, /github\.com\/onedigitas\/kit-code/);
assert.match(source, /WAITING FOR CONNECTION/);
assert.match(source, /gateway-idle-cursor/);
assert.match(source, /gateway-about-dialog/);
assert.match(source, /gateway-dialog-link-disabled/);
assert.match(source, /Terms &amp; Conditions|Terms \& Conditions/);
assert.match(source, /aria-disabled="true"/);
assert.match(source, /assistantSetupPromptFor\('codex'\)/);
assert.match(source, /assistantSetupPromptFor\('claude'\)/);
assert.match(source, /data-testid="gateway-page"/);
assert.match(source, /data-testid="gateway-session-log"/);
assert.match(source, /data-testid="gateway-about-cta"/);
assert.match(source, /github-mark\.png/);
assert.match(source, /data-testid="gateway-github-logo"/);
assert.match(source, /data-testid="gateway-repo-link"/);
assert.match(source, /data-testid=\{`copy-\$\{option\.agent\}`\}/);
assert.match(source, /agent: 'codex'/);
assert.match(source, /agent: 'claude'/);
assert.match(source, /GatewaySessionLogScatter/);

assert.match(css, /100dvh/);
assert.match(css, /overflow:\s*hidden/);
assert.match(css, /gateway-scatter-scroll/);
assert.match(css, /gateway-idle-cursor/);
assert.match(css, /gateway-dialog/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /--color-brand-primary/);

assert.match(scatter, /gateway-session-scatter/);
assert.match(scatter, /SESSION_TRACKS/);
assert.match(tokens, /--font-gateway/);
assert.match(tokens, /Departure Mono/);

console.log('Project gateway 9b session-log checks passed.');
