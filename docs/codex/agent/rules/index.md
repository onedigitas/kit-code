# Agent Rules

- Project root: repository npm workspace root.
- Runtime source: `packages/kitcode-cli/src/` and `packages/kitcode-cli/bin/`.
- Web source: `apps/web/src/`.
- Local state contract: `~/.kitcode/state.json`; do not mutate user state during analysis unless explicitly requested.
- Checks: root `npm run lint`, CLI package `npm run build -w @onedigitas/kitcode`, web package `npm run lint -w @kitcode/web`.
- Map refs use paths relative to the project root.
- Keep durable product facts in `agent/` JSON; keep docs here limited to read order and routing.
