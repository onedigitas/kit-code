# kitcode

Run a local KitCode companion server for your machine.

```bash
npx @onedigitas/kitcode
```

The default command turns KitCode on for the current folder, detects Git or Vibe mode, and starts or reuses the local server on `127.0.0.1:4747`. The server exposes aggregate developer activity, reward progress, active folder count, total commit count, change batch count, and total equal (`=`) presses count for the KitCode web dashboard.

The CLI/package is the source of truth for tracking, reward eligibility, redeem
state, and hook output. Skills and hooks should surface CLI context; they
should not calculate rewards, mutate the ledger, or decide voucher eligibility
themselves.

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

## Reward Tiers

Current reward-backed local tiers:

| Tier | Code | Required `=` characters |
| ---: | --- | ---: |
| `10%` | `if(tired){return 10;}` | `3` |
| `20%` | `takeBreak(20);` | `6` |
| `30%` | `while(working)break(30);` | `9` |

The dashboard may also show `50%` (`mediumStake.unlock(50);`) and `100%`
(`finalBreak.claim(100);`) milestones. Those are display-only unless the CLI or
a campaign backend explicitly exposes them as real reward tiers.

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

## Local State And Campaign Claims

Local progress lives in `~/.kitcode/state.json`. It may include registered
folders, source mode, active and idle seconds, commit count, change batch count,
the equal (`=`) ledger, counted commits or batches, and low-tier reward state.

For `10%`, `20%`, and `30%`, local CLI redeem state is enough. For higher-value
`50%` or `100%` campaign rewards, use a backend claim flow: ask the developer to
log in, show the exact data being shared, collect consent, then submit only a
minimal summary or proof hash to the campaign server.

Recommended server-side claim records include user identity, campaign id, tier,
claim status, fulfillment status, consent timestamp, and minimal aggregate
proof. Do not send source code, raw diffs, full repo paths, project names, or
the full local state file by default.

Deleting a local session should only log the developer out locally. After they
log in again with the same GitHub, OAuth, or verified email identity, the
campaign server can restore existing claim status. Without server-side identity,
the server cannot reliably know whether a new request came from the same
developer.

## Architecture Options

| Option | Pros | Cons |
| --- | --- | --- |
| Skill manages reward logic | Fastest to bootstrap and flexible in chat. | Easy to edit, hard to audit, and unsafe for valuable rewards. |
| CLI manages all reward logic | One local authority shared by dashboard, hooks, and chat. | Requires Node.js and the local server; still needs backend validation for valuable rewards. |
| Hybrid recommended model | Skills nudge, CLI owns local progress, campaign server owns high-value claims. | More moving parts and requires clear consent copy. |

## Requirements

- Node.js 20+
- Git for Git Mode

## Publishing

From the repository root, bump the package version:

```bash
npm version patch -w @onedigitas/kitcode --no-git-tag-version
```

Then update the `VERSION` constant in `packages/kitcode-cli/bin/kitcode.mjs` to
match `packages/kitcode-cli/package.json`.

Verify and publish:

```bash
npm run lint
npm run pack:cli
npm run publish:cli
```
