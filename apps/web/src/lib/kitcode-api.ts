export const KITCODE_SERVER_URL = 'http://127.0.0.1:4747';

export type Health = {
  status: 'ok';
  app: 'kitcode';
  version: string;
};

export type Summary = {
  connected: true;
  global: {
    totalActiveSeconds: number;
    totalIdleSeconds: number;
    totalCommits: number;
    totalProjects: number;
    trackingProjects: number;
  };
  reward: {
    requiredSeconds: number;
    earnedSeconds: number;
    timeLeftSeconds: number;
    progress: number;
  };
};

async function requestJson<T>(
  path: string,
  timeoutMs = 1200,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${KITCODE_SERVER_URL}${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers: body ? {'Content-Type': 'application/json'} : undefined,
      method,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`KitCode request failed: ${response.status}`);
    }

    return await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getHealth() {
  return requestJson<Health>('/api/health', 900);
}

export async function getSummary() {
  return requestJson<Summary>('/api/summary');
}
