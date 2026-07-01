# kitcode

Run a local KitCode companion server for your machine.

```bash
npx kitcode serve
```

The server binds to `127.0.0.1:4747` by default and exposes aggregate developer activity, reward progress, registered project count, tracking count, and total commit count for the KitCode web dashboard.

## Commands

```bash
kitcode serve
kitcode serve --port 4757
kitcode serve --reward-seconds 7200
kitcode add .
kitcode add /path/to/project
kitcode list
kitcode stop
kitcode start
kitcode remove .
kitcode remove /path/to/project
```

## API

```txt
GET /api/health
GET /api/summary
GET /api/projects
GET /api/events
```

Project-level mutation and commit-detail endpoints return `410 Gone`.

## Privacy

KitCode is local-first. The server does not expose raw source code, repo paths, project names, project ids, commit metadata, or arbitrary file-read endpoints.

The API returns:

- total active and idle time
- total registered and tracking project counts
- total commit count
- reward progress

The default CORS allowlist includes localhost development origins and `https://kitcode.vercel.app`.

To allow another hosted dashboard origin, set:

```bash
KITCODE_ALLOWED_ORIGINS=https://your-kitcode-web.example npx kitcode serve
```

## Requirements

- Node.js 20+
- Git
- A git repository as the current working directory
