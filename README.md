# KitCode

KitCode is a local-first coding activity dashboard. The hosted or local web UI connects to a local companion server that you run inside a git repository.

The companion server only exposes approved metadata: project timing, reward progress, project totals, and commit metadata. It does not expose raw source code or arbitrary file-read endpoints.

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

Run the local companion server from any git repo:

```bash
npm exec -w kitcode -- kitcode serve
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
