import {strict as assert} from 'node:assert';
import {createServer} from '../src/api.mjs';

const runtime = {
  options: {
    rewardSeconds: 3600,
    rewardEquals: 100,
  },
  projectRuns: new Map(),
  state: {
    projects: {},
  },
};

const app = createServer(runtime, 'verification');
const server = app.listen(0, '127.0.0.1');
await new Promise((resolve, reject) => {
  server.once('listening', resolve);
  server.once('error', reject);
});

const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), {
    status: 'ok',
    app: 'kitcode',
    version: 'verification',
  });

  const summaryResponse = await fetch(`${baseUrl}/api/summary`);
  assert.equal(summaryResponse.status, 200);
  const summary = await summaryResponse.json();
  assert.equal(summary.connected, true);
  assert.equal(summary.global.trackingProjects, 0);
  assert.ok(Array.isArray(summary.reward.tiers));

  const terminalResponse = await fetch(`${baseUrl}/terminal`);
  assert.equal(terminalResponse.status, 200);
  assert.match(terminalResponse.headers.get('content-type'), /^text\/html/);
  const terminalHtml = await terminalResponse.text();
  assert.match(terminalHtml, /data-testid="pet-toggle"/);
  assert.match(terminalHtml, /aria-pressed="false" disabled/);
  assert.match(terminalHtml, /independent companion/);

  const petResponse = await fetch(`${baseUrl}/pet`);
  assert.equal(petResponse.status, 200);
  assert.match(petResponse.headers.get('content-type'), /^text\/html/);
  const petHtml = await petResponse.text();
  assert.match(petHtml, /Kit Terminal pet/);
  assert.match(petHtml, /\/api\/summary/);
  assert.match(petHtml, /\/api\/events/);

  const companionResponse = await fetch(`${baseUrl}/companion`);
  assert.equal(companionResponse.status, 200);
  assert.match(companionResponse.headers.get('content-type'), /^text\/html/);
  const companionHtml = await companionResponse.text();
  assert.match(companionHtml, /const API_BASE=""/);
  assert.match(companionHtml, /fetch\(API_BASE\+'\/api\/summary'/);
  assert.match(companionHtml, /new EventSource\(API_BASE\+'\/api\/events'/);

  const manifestResponse = await fetch(`${baseUrl}/pet-assets/kit-terminal/pet.json`);
  assert.equal(manifestResponse.status, 200);
  assert.equal((await manifestResponse.json()).spriteVersionNumber, 2);

  const spritesheetResponse = await fetch(`${baseUrl}/pet-assets/kit-terminal/spritesheet.webp`);
  assert.equal(spritesheetResponse.status, 200);
  assert.match(spritesheetResponse.headers.get('content-type'), /^image\/webp/);
  const spritesheet = Buffer.from(await spritesheetResponse.arrayBuffer());
  assert.equal(spritesheet.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.ok(spritesheet.length > 1024);

  const goneResponse = await fetch(`${baseUrl}/api/projects/example/commits`);
  assert.equal(goneResponse.status, 410);

  const miniResponse = await fetch(`${baseUrl}/mini`);
  assert.equal(miniResponse.status, 404);

  const eventsAbort = new AbortController();
  const eventsResponse = await fetch(`${baseUrl}/api/events`, {signal: eventsAbort.signal});
  assert.equal(eventsResponse.status, 200);
  assert.equal(eventsResponse.headers.get('content-type'), 'text/event-stream');
  const reader = eventsResponse.body.getReader();
  const firstEvent = Buffer.from((await reader.read()).value).toString('utf8');
  assert.match(firstEvent, /event: summary/);
  assert.match(firstEvent, /"trackingProjects":0/);
  eventsAbort.abort();
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('Pet API checks passed.');
