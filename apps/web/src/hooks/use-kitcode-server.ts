import { useEffect, useState } from 'react';
import { getHealth, getSummary, redeemReward, Summary } from '../lib/kitcode-api';

type KitCodeState = {
  isConnected: boolean;
  isChecking: boolean;
  summary: Summary | null;
  lastCheckedAt: Date | null;
};

const POLL_INTERVAL_MS = 1000;

export function useKitCodeServer() {
  const [state, setState] = useState<KitCodeState>({
    isConnected: false,
    isChecking: true,
    summary: null,
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

        if (!isMounted) {
          return;
        }

        setState({
          isConnected: true,
          isChecking: false,
          summary,
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

  async function refresh() {
    const summary = await getSummary();

    setState((previous) => ({
      ...previous,
      isConnected: true,
      isChecking: false,
      summary,
      lastCheckedAt: new Date(),
    }));
  }

  async function redeem() {
    const summary = await redeemReward();

    setState((previous) => ({
      ...previous,
      isConnected: true,
      isChecking: false,
      summary,
      lastCheckedAt: new Date(),
    }));
  }

  return {
    ...state,
    redeem,
    refresh,
  };
}
