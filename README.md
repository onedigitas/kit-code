# KitCode

KitCode is a local-first coding activity dashboard. The hosted or local web UI connects to a local companion server that tracks git repositories on your machine.

The companion server only exposes aggregate developer stats: total active time, idle time, reward progress, registered project count, tracking count, and total commit count. It does not expose raw source code, repo paths, project names, project ids, commit metadata, or arbitrary file-read endpoints.

## Workspace

```txt
apps/web/                 Vite React dashboard
packages/kitcode-cli/     npm package for `npx kitcode serve`
```

## Development

Install dependencies:

```bash
npm install
```

Run the web app:

```bash
npm run dev
```

Run the local companion server:

```bash
npm exec -w kitcode -- kitcode serve
```

Register a git project in another terminal:

```bash
npm exec -w kitcode -- kitcode add /path/to/project
```

Build and validate all workspaces:

```bash
npm run lint
npm run build
```

Preview the npm package contents:

```bash
npm run pack:cli
```

## Publishing

Only `packages/kitcode-cli` is publishable. The web app remains private.

```bash
npm publish -w kitcode
```
