import express from 'express';
import {corsMiddleware} from './cors.mjs';
import {buildSummary} from './runtime.mjs';

export function createServer(runtime, version) {
  const app = express();

  app.use(corsMiddleware);

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
    res.json(buildSummary(runtime).projects);
  });

  app.get('/api/projects/:id/commits', (req, res) => {
    const project = runtime.state.projects[req.params.id];

    if (!project) {
      res.status(404).json({error: 'Project not found'});
      return;
    }

    res.json(project.commits ?? []);
  });

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = () => {
      res.write('event: summary\n');
      res.write(`data: ${JSON.stringify(buildSummary(runtime))}\n\n`);
    };
    const interval = setInterval(send, 3000);

    send();
    req.on('close', () => clearInterval(interval));
  });

  return app;
}
