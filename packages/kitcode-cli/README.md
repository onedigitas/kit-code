# kitcode

Run a local KitCode companion server for your machine.

```bash
npx @onedigitas/kitcode
```

The default command turns KitCode on for the current folder, detects Git or Vibe mode, and starts or reuses the local server on `127.0.0.1:4747`. The server exposes aggregate developer activity, reward progress, active folder count, total commit count, change batch count, and total equal (`=`) presses count for the KitCode web dashboard.

## Commands

```bash
kitcode serve
kitcode serve --port 4757
kitcode serve --reward-seconds 3600
kitcode serve --reward-equals 30
kitcode add .
kitcode add /path/to/project
kitcode break
kitcode list
kitcode stop
kitcode start
kitcode remove .
kitcode remove /path/to/project
kitcode reward
kitcode redeem
kitcode redeem --tier 10
kitcode codex on
kitcode codex status
kitcode codex off
kitcode claude on
kitcode claude status
kitcode claude off
```

Codex and Claude installers add both the KitCode skill and the prompt hook. The
hooks are soft notifications. They never block prompts; when a new voucher
milestone is ready, they add a short context reminder and try a best-effort
desktop notification.

## API

```txt
GET /api/health
GET /api/summary
GET /api/projects
GET /api/events
POST /api/reward/redeem
```

Project-level mutation and commit-detail endpoints return `410 Gone`.

## Privacy

KitCode is local-first. The server does not expose raw source code, repo paths, project names, project ids, commit metadata, or arbitrary file-read endpoints.

The API returns:

- total active and idle time
- active folder count
- total commit count
- total change batch count
- total equal (`=`) presses count
- reward progress

The default CORS allowlist includes localhost development origins and `https://kitcode.onedigitas.com`.

To allow another hosted dashboard origin, set:

```bash
KITCODE_ALLOWED_ORIGINS=https://your-kitcode-web.example npx @onedigitas/kitcode serve
```

## Requirements

- Node.js 20+
- Git for Git Mode
