import { useEffect, useState } from 'react';
import { CommitInfo, getHealth, getProjectCommits, getSummary, Summary } from '../lib/kitcode-api';

type KitCodeState = {
  isConnected: boolean;
  isChecking: boolean;
  summary: Summary | null;
  commits: CommitInfo[];
  lastCheckedAt: Date | null;
};

const POLL_INTERVAL_MS = 3000;

export function useKitCodeServer() {
  const [state, setState] = useState<KitCodeState>({
    isConnected: false,
    isChecking: true,
    summary: null,
    commits: [],
    lastCheckedAt: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function poll() {
      try {
        const health = await getHealth();

        if (health.status !== 'ok' || health.app !== 'kitcode') {
          throw new Error('KitCode server identity mismatch');
        }

        const summary = await getSummary();
        const commits = await getProjectCommits(summary.currentProject.id);

        if (!isMounted) {
          return;
        }

        setState({
          isConnected: true,
          isChecking: false,
          summary,
          commits,
          lastCheckedAt: new Date(),
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setState((previous) => ({
          ...previous,
          isConnected: false,
          isChecking: false,
          summary: null,
          commits: [],
          lastCheckedAt: new Date(),
        }));
      }
    }

    poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return state;
}
