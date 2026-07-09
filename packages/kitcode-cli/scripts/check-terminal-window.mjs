import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderTerminalWindow} from '../src/terminal-window.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiSource = fs.readFileSync(path.join(packageRoot, 'src/api.mjs'), 'utf8');
const electronSource = fs.readFileSync(path.join(packageRoot, 'src/terminal-electron.mjs'), 'utf8');
const preloadSource = fs.readFileSync(path.join(packageRoot, 'src/terminal-preload.cjs'), 'utf8');
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
excludes(apiSource, "app.get('/mini'", 'API should not serve the removed mini route');
excludes(apiSource, 'renderMiniWindow', 'API should not import or render the removed mini surface');

includes(electronSource, "const terminalUrl = process.env.KITCODE_TERMINAL_URL ?? 'http://127.0.0.1:4747/terminal';", 'Electron should load the terminal URL');
includes(electronSource, 'const terminalWidth = 960;', 'Terminal should have an intentional desktop width');
includes(electronSource, 'const terminalHeight = 620;', 'Terminal should have an intentional desktop height');
includes(electronSource, 'const terminalMinWidth = 680;', 'Terminal should enforce a usable minimum width');
includes(electronSource, 'const terminalMinHeight = 420;', 'Terminal should enforce a usable minimum height');
includes(electronSource, "compact: {", 'Electron should define a compact mode preset');
includes(electronSource, "progress: {", 'Electron should define a progress mode preset');
includes(electronSource, "watch: {", 'Electron should define a watch mode preset');
includes(electronSource, "position: 'bottom-right'", 'Compact/progress modes should support bottom-right placement');
includes(electronSource, "position: 'top-right'", 'Watch mode should support top-right placement');
excludes(electronSource, "island: {", 'Electron should not define the removed island preset');
excludes(electronSource, "position: 'top-center'", 'Electron should not keep dynamic-island top-center placement');
includes(electronSource, 'workArea.x + ((workArea.width - terminalWidth) / 2)', 'Terminal should center horizontally');
includes(electronSource, 'workArea.y + ((workArea.height - terminalHeight) / 2)', 'Terminal should center vertically');
includes(electronSource, "ipcMain.handle('kitcode:set-view-mode'", 'Electron should expose an allowlisted mode-change handler');
includes(electronSource, 'event.sender !== window.webContents', 'Mode-change IPC should be scoped to the terminal window');
includes(electronSource, 'setResizable(true)', 'Terminal mode should restore user resizing');
includes(electronSource, 'setResizable(false)', 'Glance modes should disable user resizing');
includes(electronSource, 'setMinimumSize(preset.width, preset.height)', 'Glance modes should lock minimum size to their preset');
includes(electronSource, 'setMaximumSize(preset.width, preset.height)', 'Glance modes should lock maximum size to their preset');
includes(electronSource, 'setAlwaysOnTop(true,', 'Glance modes should float above normal windows');
includes(electronSource, 'frame: false', 'Terminal should use a frameless window without the native header panel');
includes(electronSource, 'resizable: true', 'Terminal window should be resizable');
includes(electronSource, 'movable: true', 'Terminal window should be movable');
includes(electronSource, 'preload: preloadPath', 'Terminal should load a narrow preload bridge');
includes(electronSource, 'nodeIntegration: false', 'Terminal window should not expose Node integration');
includes(electronSource, 'sandbox: true', 'Terminal window should be sandboxed');
includes(electronSource, 'shell.openExternal(url)', 'External opens should be delegated safely');

includes(preloadSource, "contextBridge.exposeInMainWorld('kitcodeTerminal'", 'Preload should expose a narrow terminal bridge');
includes(preloadSource, "new Set(['terminal', 'compact', 'progress', 'watch'])", 'Preload should allow only known mode ids');
excludes(preloadSource, "'island'", 'Preload should not allow the removed island mode');
includes(preloadSource, "ipcRenderer.invoke('kitcode:set-view-mode', mode)", 'Preload should invoke only the mode-change IPC channel');
excludes(preloadSource, 'shell', 'Preload should not expose shell APIs');
excludes(preloadSource, 'fs', 'Preload should not expose filesystem APIs');

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
includes(terminalHtml, 'class="view-switcher"', 'Terminal should expose the view mode switcher');
includes(terminalHtml, 'class="view-switcher-label">View mode</span>', 'Switcher should include the View mode label');
includes(terminalHtml, 'data-mode="terminal"', 'Switcher should include terminal mode');
includes(terminalHtml, 'data-mode="compact"', 'Switcher should include compact mode');
includes(terminalHtml, 'data-mode="progress"', 'Switcher should include progress mode');
includes(terminalHtml, 'data-mode="watch"', 'Switcher should include watch mode');
includes(terminalHtml, 'class="mode-icon mode-icon-terminal"', 'Terminal mode should use an icon instead of a letter');
includes(terminalHtml, 'class="mode-icon mode-icon-compact"', 'Compact mode should use an icon instead of a letter');
includes(terminalHtml, 'class="mode-icon mode-icon-progress"', 'Progress mode should use an icon instead of a letter');
includes(terminalHtml, 'class="mode-icon mode-icon-watch"', 'Watch mode should use an icon instead of a letter');
excludes(terminalHtml, 'data-mode="island"', 'Switcher should not include the removed island mode');
excludes(terminalHtml, 'Dynamic island', 'Terminal should not mention the removed dynamic island view');
excludes(terminalHtml, 'island-view', 'Terminal should not render the removed island view');
includes(terminalHtml, "window.kitcodeTerminal?.setViewMode", 'Renderer should use the allowlisted Electron mode bridge when available');
includes(terminalHtml, 'id="commandInput"', 'Terminal should expose the command input');
includes(terminalHtml, 'id="output"', 'Terminal should expose command output history');
includes(terminalHtml, 'safe-shell', 'Terminal should label itself as a safe shell');
includes(terminalHtml, 'Available KitCode commands:', 'Terminal should include help copy');
includes(terminalHtml, 'help status summary rewards dashboard clear', 'Terminal should advertise supported commands');
excludes(terminalHtml, 'dashboard mini clear', 'Terminal should not advertise the removed mini command');
includes(terminalHtml, "normalized === 'help'", 'Terminal should support help');
includes(terminalHtml, "normalized === 'status'", 'Terminal should support status');
includes(terminalHtml, "normalized === 'summary'", 'Terminal should support summary');
includes(terminalHtml, "normalized === 'rewards'", 'Terminal should support rewards');
includes(terminalHtml, "normalized === 'dashboard'", 'Terminal should support dashboard');
includes(terminalHtml, "normalized === 'clear'", 'Terminal should support clear');
includes(terminalHtml, "fetch('/api/summary'", 'Terminal should read existing local summary data');
includes(terminalHtml, "new EventSource('/api/events')", 'Terminal modes should keep the existing summary event stream');
includes(terminalHtml, "tier.status === 'ready'", 'Terminal modes should prioritize ready reward tiers');
includes(terminalHtml, "connectionState === 'reconnecting'", 'Terminal modes should handle reconnecting state');
includes(terminalHtml, "state = 'idle'", 'Terminal modes should handle idle state');
includes(terminalHtml, 'Command not found. Type "help"', 'Unknown commands should be safe and helpful');
includes(terminalHtml, 'does not run system shell commands', 'Terminal should disclose the safe-shell boundary');
includes(terminalHtml, "event.key === 'ArrowUp'", 'Terminal should support previous command history');
includes(terminalHtml, "event.key === 'ArrowDown'", 'Terminal should support next command history');
matches(terminalHtml, /h1\s*{[\s\S]*font-size: 92px;[\s\S]*letter-spacing: 0;/, 'Terminal title should be large with stable typography');

excludes(terminalHtml, 'child_process', 'Terminal HTML should not mention child_process');
excludes(terminalHtml, 'spawn(', 'Terminal HTML should not spawn processes');
excludes(terminalHtml, 'exec(', 'Terminal HTML should not execute shell commands');
excludes(terminalHtml, "normalized === 'mini'", 'Terminal should not support the removed mini command');
excludes(terminalHtml, 'kitcode mini', 'Terminal should not instruct users to run the removed mini command');
excludes(terminalHtml, 'nodeIntegration: true', 'Terminal HTML should not request Node integration');
excludes(terminalHtml, oldPrimaryLower, 'Old matcha primary should not remain in terminal HTML');
excludes(terminalHtml, oldPrimaryUpper, 'Old matcha primary should not remain in terminal HTML');
excludes(terminalHtml, oldPrimaryRgb, 'Old matcha RGB primary should not remain in terminal HTML');

console.log('Terminal window checks passed.');
