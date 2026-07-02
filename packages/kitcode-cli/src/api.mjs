import express from 'express';
import {corsMiddleware} from './cors.mjs';
import {buildSummary} from './runtime.mjs';
import {normalizeTierPercent, redeemReadyTiers} from './reward.mjs';
import {saveState} from './store.mjs';

const projectLevelGone = (_req, res) => {
  res.status(410).json({error: 'Project-level metadata is no longer exposed'});
};

export function createServer(runtime, version) {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'kitcode',
      version,
    });
  });

  app.get('/api/summary', (_req, res) => {
    res.json(buildSummary(runtime));
  });

  app.get('/api/projects', (_req, res) => {
    res.json(buildSummary(runtime).global);
  });

  app.post('/api/reward/redeem', (req, res) => {
    const requestedTier = req.body?.tier;

    if (requestedTier !== undefined && !normalizeTierPercent(requestedTier)) {
      res.status(400).json({error: 'Invalid reward tier'});
      return;
    }

    saveState(runtime.state);
    const result = redeemReadyTiers(requestedTier === undefined ? null : requestedTier);

    res.json({
      ...result,
      summary: buildSummary(runtime),
    });
  });

  app.get('/api/projects/:id/commits', projectLevelGone);
  app.post('/api/projects/:id/start', projectLevelGone);
  app.post('/api/projects/:id/stop', projectLevelGone);
  app.post('/api/projects/selection', projectLevelGone);

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = () => {
      res.write('event: summary\n');
      res.write(`data: ${JSON.stringify(buildSummary(runtime))}\n\n`);
    };
    const interval = setInterval(send, 1000);

    send();
    req.on('close', () => clearInterval(interval));
  });

  return app;
}
