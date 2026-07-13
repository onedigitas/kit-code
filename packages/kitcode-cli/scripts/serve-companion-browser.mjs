import {createServer} from '../src/api.mjs';

const port = Number(process.env.KITCODE_COMPANION_TEST_PORT) || 4790;
const runtime = {
  options: {rewardSeconds: 3600, rewardEquals: 100},
  projectRuns: new Map(),
  state: {
    projects: {
      preview: {
        id: 'preview',
        repoRoot: '/workspace/preview',
        sourceType: 'vibe',
        active: true,
        activeSeconds: 900,
        idleSeconds: 0,
        commitCount: 0,
        changeBatchCount: 1,
        lastActiveAt: new Date().toISOString(),
        sourceSnapshot: {version: 1, files: {}},
      },
    },
  },
};
const app = createServer(runtime, 'companion-preview');
app.get('/mini-preview', (_request, response) => {
  response.type('html').send('<!doctype html><html><body style="margin:0;background:#111"><iframe title="Mini preview" src="/companion" style="display:block;width:320px;height:110px;border:0"></iframe></body></html>');
});
const server = app.listen(port, '127.0.0.1', () => console.log(`Companion preview: http://127.0.0.1:${port}`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
