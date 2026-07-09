import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderMiniWindow} from '../src/mini-window.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const electronSource = fs.readFileSync(path.join(packageRoot, 'src/mini-electron.mjs'), 'utf8');
const miniHtml = renderMiniWindow();
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

includes(electronSource, 'const width = 320;', 'Electron width should be the selected fixed panel width');
includes(electronSource, 'const height = 148;', 'Electron height should be the selected fixed panel height');
includes(electronSource, 'const rightMargin = 28;', 'Electron should keep the safe right margin');
includes(electronSource, 'const bottomMargin = 72;', 'Electron should keep the safe bottom margin');
includes(electronSource, 'workArea.y + workArea.height - height - bottomMargin', 'Electron should open from the bottom edge of the work area');
includes(electronSource, 'workArea.x + workArea.width - width - rightMargin', 'Electron should open from the right edge of the work area');
includes(electronSource, 'resizable: false', 'Electron window should not be resizable');
includes(electronSource, 'movable: true', 'Electron window should remain movable');
includes(electronSource, 'alwaysOnTop: true', 'Electron window should remain always on top');
includes(electronSource, 'window.setMinimumSize(width, height)', 'Electron minimum size should lock to panel dimensions');
includes(electronSource, 'window.setMaximumSize(width, height)', 'Electron maximum size should lock to panel dimensions');
includes(electronSource, 'shell.openExternal(url)', 'Dashboard opens should be delegated out of the sandboxed mini window');

includes(miniHtml, 'class="panel"', 'Mini HTML should render the panel shell');
includes(miniHtml, 'id="panel"', 'Mini HTML should expose the panel state node');
includes(miniHtml, '--accent: #fc0a0a;', 'Mini default primary accent should use the red brand color');
includes(miniHtml, 'min-width: 320px', 'Mini HTML should use the selected fixed panel width');
includes(miniHtml, 'min-height: 148px', 'Mini HTML should use the selected fixed panel height');
includes(miniHtml, 'height: min(100vh, 148px)', 'Panel should stay within the selected fixed height');
includes(miniHtml, 'KitCode', 'Panel should show KitCode identity');
includes(miniHtml, 'id="percent"', 'Panel should show progress percent');
includes(miniHtml, 'role="progressbar"', 'Panel should expose a compact progress indicator');
includes(miniHtml, 'id="statusText"', 'Panel should show status text');
includes(miniHtml, 'id="closeButton"', 'Panel should keep a close button');
includes(miniHtml, 'id="openButton"', 'Panel body should keep the dashboard open action');
includes(miniHtml, '-webkit-app-region: drag', 'Panel should keep draggable regions');
includes(miniHtml, '-webkit-app-region: no-drag', 'Interactive controls should opt out of drag');
includes(miniHtml, "event.stopPropagation();", 'Close should not trigger other click handlers');
includes(miniHtml, "window.close();", 'Close button should close the mini window');
includes(miniHtml, "window.open(DASHBOARD_URL, '_blank', 'noopener');", 'Panel body should open the dashboard/detail destination');
includes(miniHtml, "fetch('/api/summary')", 'Mini should keep the existing summary fetch');
includes(miniHtml, "new EventSource('/api/events')", 'Mini should keep the existing summary event stream');
includes(miniHtml, "tier.status === 'ready'", 'Mini should prioritize ready reward tiers');
includes(miniHtml, "setState('ready', 'ready', 'Break ready', 'Open dashboard to claim')", 'Ready state should have dedicated visible copy');
includes(miniHtml, "setState('live', 'live', 'Break progress', 'Tracking your focus')", 'Live state should have dedicated visible copy');
includes(miniHtml, "setState('idle', 'idle', 'No project active', 'Run kitcode add')", 'Idle state should have dedicated visible copy');
includes(miniHtml, "setState('offline', 'offline', 'Tracker offline', 'Run kitcode track')", 'Offline state should have dedicated visible copy');
includes(miniHtml, "setState('reconnecting', 'sync', 'Reconnecting', 'Waiting for tracker')", 'Reconnect state should have dedicated visible copy');
includes(miniHtml, "nodes.progress.setAttribute('aria-valuenow', String(value));", 'Progressbar should update with live progress');
includes(miniHtml, 'overflow: hidden', 'Panel should avoid scrollbars and clipping spillover');
includes(miniHtml, 'text-overflow: ellipsis', 'Long text should be constrained inside the fixed panel');
matches(miniHtml, /\.percent\s*{[\s\S]*font-size: 43px;[\s\S]*white-space: nowrap;/, 'Percent should be readable and fixed-width safe');

excludes(miniHtml, 'id="chip"', 'Old micro chip shell should not render');
excludes(miniHtml, 'Mini.tsx', 'Old large mini header should not render');
excludes(miniHtml, 'equal presses', 'Old metric tile copy should not render');
excludes(miniHtml, 'class="ring"', 'Old progress ring should not render');
excludes(miniHtml, 'min-width: 160px', 'Old micro chip width should not remain');
excludes(miniHtml, 'min-height: 64px', 'Old micro chip height should not remain');
excludes(miniHtml, oldPrimaryLower, 'Old matcha primary should not remain in mini HTML');
excludes(miniHtml, oldPrimaryUpper, 'Old matcha primary should not remain in mini HTML');
excludes(miniHtml, oldPrimaryRgb, 'Old matcha RGB primary should not remain in mini HTML');

console.log('Mini window checks passed.');
