import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {corsMiddleware} from '../src/cors.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const corsSource = fs.readFileSync(path.join(root, 'src/cors.mjs'), 'utf8');
const kitcodeApiSource = fs.readFileSync(
  path.resolve(root, '../../apps/web/src/lib/kitcode-api.ts'),
  'utf8',
);

assert.match(corsSource, /https:\/\/kitcode\.vercel\.app/, 'CORS must allow the hosted dashboard origin');
assert.match(kitcodeApiSource, /targetAddressSpace:\s*'loopback'/, 'Dashboard fetch must target loopback address space');
assert.doesNotMatch(kitcodeApiSource, /targetAddressSpace:\s*'local'/, 'Dashboard fetch must not use local address space for 127.0.0.1');

const cliSource = fs.readFileSync(path.join(root, 'bin/kitcode.mjs'), 'utf8');
assert.match(cliSource, /trackerAllowedOrigins/, 'Tracker spawn must inject dashboard CORS origins');
assert.match(cliSource, /KITCODE_ALLOWED_ORIGINS: trackerAllowedOrigins\(\)/, 'Tracker child env must include dashboard CORS origins');

function createResponse() {
  const headers = new Map();

  return {
    statusCode: 200,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), value);
    },
    getHeader(name) {
      return headers.get(String(name).toLowerCase());
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {},
  };
}

for (const [method, pathName] of [['OPTIONS', '/api/health'], ['GET', '/api/health']]) {
  const req = {
    method,
    headers: {
      origin: 'https://kitcode.vercel.app',
      'access-control-request-private-network': 'true',
    },
    path: pathName,
  };
  const res = createResponse();
  let reachedNext = false;

  corsMiddleware(req, res, () => {
    reachedNext = true;
  });

  assert.equal(
    res.getHeader('access-control-allow-origin'),
    'https://kitcode.vercel.app',
    `${method} must echo the hosted dashboard origin`,
  );
  assert.equal(
    res.getHeader('access-control-allow-private-network'),
    'true',
    `${method} must opt in to private network access`,
  );

  if (method === 'OPTIONS') {
    assert.equal(res.statusCode, 204, 'OPTIONS preflight must short-circuit with 204');
    assert.equal(reachedNext, false, 'OPTIONS preflight must not continue to route handlers');
  } else {
    assert.equal(reachedNext, true, 'GET must continue to route handlers');
  }
}

console.log('KitCode CORS checks passed.');
