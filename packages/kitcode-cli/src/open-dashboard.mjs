import {spawn} from 'node:child_process';

export const DASHBOARD_URL = 'https://kitcode.vercel.app/';

export function openDashboard(url = DASHBOARD_URL) {
  const opener = process.platform === 'darwin'
    ? {command: 'open', args: [url]}
    : process.platform === 'win32'
      ? {command: 'cmd', args: ['/c', 'start', '', url]}
      : {command: 'xdg-open', args: [url]};

  try {
    const child = spawn(opener.command, opener.args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });

    child.on('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
}
