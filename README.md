# KitCode

KitCode is a local-first coding activity dashboard. The hosted or local web UI connects to a local companion server that tracks coding folders on your machine.

The companion server only exposes aggregate developer stats: total active time, idle time, reward progress, active folder count, total commit count, and total shipped `=` count. It does not expose raw source code, repo paths, project names, project ids, commit metadata, or arbitrary file-read endpoints.

## Workspace

```txt
apps/web/                 Vite React dashboard
packages/kitcode-cli/     npm package for `npx @onedigitas/kitcode`
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

Run KitCode from a coding folder:

```bash
npm exec -w @onedigitas/kitcode -- kitcode
```

Pause tracking for the current folder:

```bash
npm exec -w @onedigitas/kitcode -- kitcode break
```

Install soft voucher hooks for local agents:

```bash
npm exec -w @onedigitas/kitcode -- kitcode codex on
npm exec -w @onedigitas/kitcode -- kitcode claude on
```

Redeem ready voucher milestones:

```bash
npm exec -w @onedigitas/kitcode -- kitcode reward
npm exec -w @onedigitas/kitcode -- kitcode redeem
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
npm publish -w @onedigitas/kitcode --access public
```
