export const KITCODE_SERVER_URL = 'http://127.0.0.1:4747';

export type Health = {
  status: 'ok';
  app: 'kitcode';
  version: string;
};

export type ProjectStats = {
  id: string;
  name: string;
  activeSeconds: number;
  idleSeconds: number;
  commitCount: number;
  lastActiveAt: string;
};

export type CommitInfo = {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  message: string;
  committedAt: string;
};

export type Summary = {
  connected: true;
  currentProject: ProjectStats;
  projects: ProjectStats[];
  global: {
    totalActiveSeconds: number;
    totalIdleSeconds: number;
    totalCommits: number;
    totalProjects: number;
  };
  reward: {
    requiredSeconds: number;
    earnedSeconds: number;
    timeLeftSeconds: number;
    progress: number;
  };
};

async function requestJson<T>(path: string, timeoutMs = 1200): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${KITCODE_SERVER_URL}${path}`, {
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

export async function getProjectCommits(projectId: string) {
  return requestJson<CommitInfo[]>(`/api/projects/${encodeURIComponent(projectId)}/commits`);
}
