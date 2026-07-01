# kitcode

Run a local KitCode companion server for a git repository.

```bash
npx kitcode serve
```

The server binds to `127.0.0.1:4747` by default and exposes project activity, reward progress, and commit metadata for the KitCode web dashboard.

## Commands

```bash
kitcode serve
kitcode serve --port 4757
kitcode serve --reward-seconds 7200
```

## API

```txt
GET /api/health
GET /api/summary
GET /api/projects
GET /api/projects/:id/commits
GET /api/events
```

## Privacy

KitCode is local-first. The server does not expose raw source code and does not provide arbitrary file-read endpoints.

The API returns:

- project timing
- global totals
- reward progress
- git commit metadata

The default CORS allowlist is localhost-only. To allow a hosted dashboard origin, set:

```bash
KITCODE_ALLOWED_ORIGINS=https://your-kitcode-web.example npx kitcode serve
```

## Requirements

- Node.js 20+
- Git
- A git repository as the current working directory
