import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderTerminalWindow} from '../src/terminal-window.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiSource = fs.readFileSync(path.join(packageRoot, 'src/api.mjs'), 'utf8');
const electronSource = fs.readFileSync(path.join(packageRoot, 'src/terminal-electron.mjs'), 'utf8');
const terminalHtml = renderTerminalWindow();
const oldPrimaryLower = `#${'8bc34a'}`;
const oldPrimaryUpper = `#${'8BC34A'}`;
const oldPrimaryRgb = `rgba(${139}, ${195}, ${74}`;

function includes(value, expected, message) {
  assert.ok(value.includes(expected), message ?? `Expected to include ${expected}`);
}

function excludes(value, expected, message) {
  assert.ok(!value.includes(expected), message ?? `Expected not to include ${expected}`);
}

function matches(value, pattern, message) {
  assert.match(value, pattern, message);
}

includes(apiSource, "import {renderTerminalWindow} from './terminal-window.mjs';", 'API should import the terminal renderer');
includes(apiSource, "app.get('/terminal'", 'API should serve the terminal route');
includes(apiSource, 'renderTerminalWindow()', 'API should render terminal HTML');

includes(electronSource, "const terminalUrl = process.env.KITCODE_TERMINAL_URL ?? 'http://127.0.0.1:4747/terminal';", 'Electron should load the terminal URL');
includes(electronSource, 'const width = 960;', 'Terminal should have an intentional desktop width');
includes(electronSource, 'const height = 620;', 'Terminal should have an intentional desktop height');
includes(electronSource, 'const minWidth = 680;', 'Terminal should enforce a usable minimum width');
includes(electronSource, 'const minHeight = 420;', 'Terminal should enforce a usable minimum height');
includes(electronSource, 'workArea.x + ((workArea.width - width) / 2)', 'Terminal should center horizontally');
includes(electronSource, 'workArea.y + ((workArea.height - height) / 2)', 'Terminal should center vertically');
includes(electronSource, 'frame: false', 'Terminal should use a frameless window without the native header panel');
includes(electronSource, 'resizable: true', 'Terminal window should be resizable');
includes(electronSource, 'movable: true', 'Terminal window should be movable');
includes(electronSource, 'nodeIntegration: false', 'Terminal window should not expose Node integration');
includes(electronSource, 'sandbox: true', 'Terminal window should be sandboxed');
includes(electronSource, 'shell.openExternal(url)', 'External opens should be delegated safely');
excludes(electronSource, 'setMaximumSize', 'Terminal should not lock the maximum size');

includes(terminalHtml, '<title>KitCode Terminal</title>', 'Terminal route should set a clear title');
includes(terminalHtml, '<h1>KITCODE TERMINAL</h1>', 'Terminal should show the large title');
includes(terminalHtml, 'Hello, KitCoder.', 'Terminal should use English greeting copy');
includes(terminalHtml, 'kitcode ~ %', 'Terminal should show the prompt');
includes(terminalHtml, '--primary: #fc0a0a;', 'Terminal primary accent should use the red brand color');
includes(terminalHtml, 'id="closeButton"', 'Terminal should expose an in-content close control');
includes(terminalHtml, 'class="terminal-close"', 'Terminal close control should use custom terminal chrome');
includes(terminalHtml, "window.close();", 'Terminal close control should close the frameless window');
includes(terminalHtml, '-webkit-app-region: drag', 'Terminal should expose a draggable custom chrome region');
includes(terminalHtml, '-webkit-app-region: no-drag', 'Terminal interactive regions should opt out of drag');
includes(terminalHtml, 'id="commandInput"', 'Terminal should expose the command input');
includes(terminalHtml, 'id="output"', 'Terminal should expose command output history');
includes(terminalHtml, 'safe-shell', 'Terminal should label itself as a safe shell');
includes(terminalHtml, 'Available KitCode commands:', 'Terminal should include help copy');
includes(terminalHtml, 'help status summary rewards dashboard mini clear', 'Terminal should advertise supported commands');
includes(terminalHtml, "normalized === 'help'", 'Terminal should support help');
includes(terminalHtml, "normalized === 'status'", 'Terminal should support status');
includes(terminalHtml, "normalized === 'summary'", 'Terminal should support summary');
includes(terminalHtml, "normalized === 'rewards'", 'Terminal should support rewards');
includes(terminalHtml, "normalized === 'dashboard'", 'Terminal should support dashboard');
includes(terminalHtml, "normalized === 'mini'", 'Terminal should support mini');
includes(terminalHtml, "normalized === 'clear'", 'Terminal should support clear');
includes(terminalHtml, "fetch('/api/summary'", 'Terminal should read existing local summary data');
includes(terminalHtml, 'Command not found. Type "help"', 'Unknown commands should be safe and helpful');
includes(terminalHtml, 'does not run system shell commands', 'Terminal should disclose the safe-shell boundary');
includes(terminalHtml, "event.key === 'ArrowUp'", 'Terminal should support previous command history');
includes(terminalHtml, "event.key === 'ArrowDown'", 'Terminal should support next command history');
matches(terminalHtml, /h1\s*{[\s\S]*font-size: 92px;[\s\S]*letter-spacing: 0;/, 'Terminal title should be large with stable typography');

excludes(terminalHtml, 'child_process', 'Terminal HTML should not mention child_process');
excludes(terminalHtml, 'spawn(', 'Terminal HTML should not spawn processes');
excludes(terminalHtml, 'exec(', 'Terminal HTML should not execute shell commands');
excludes(terminalHtml, 'nodeIntegration: true', 'Terminal HTML should not request Node integration');
excludes(terminalHtml, oldPrimaryLower, 'Old matcha primary should not remain in terminal HTML');
excludes(terminalHtml, oldPrimaryUpper, 'Old matcha primary should not remain in terminal HTML');
excludes(terminalHtml, oldPrimaryRgb, 'Old matcha RGB primary should not remain in terminal HTML');

console.log('Terminal window checks passed.');
