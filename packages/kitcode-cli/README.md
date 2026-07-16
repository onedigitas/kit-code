# @onedigitas/kitcode

Local break companion for coding campaigns. The CLI tracks focused activity on your machine, serves aggregate progress over a local API, and opens terminal or companion surfaces so users can see break progress.

Published package: `@onedigitas/kitcode`

Hosted dashboard: [https://kitcode.onedigitas.com/](https://kitcode.onedigitas.com/)

## Install And Run

Run from a project folder. Use the command on the left, then look for the screen on the right.

<table>
  <tr>
    <th>Command</th>
    <th>What it opens or enables</th>
  </tr>
  <tr>
    <td>
      <pre><code>npx @onedigitas/kitcode codex on
npx @onedigitas/kitcode claude on</code></pre>
    </td>
    <td>
      <img alt="KitCode welcome screen" src="../../docs/images/kitcode-welcome.png" width="480" />
      <br />
      Codex / Claude integration plus optional Welcome setup when onboarding is not complete.
    </td>
  </tr>
  <tr>
    <td>
      <pre><code>npx @onedigitas/kitcode add .
npx @onedigitas/kitcode track
npx @onedigitas/kitcode terminal</code></pre>
    </td>
    <td>
      <img alt="KitCode terminal view modes" src="../../docs/images/kitcode-mini.png" width="480" />
      <br />
      Terminal: safe command surface with compact, progress, and watch view modes plus an opt-in PET toggle.
    </td>
  </tr>
  <tr>
    <td>
      <pre><code>npx @onedigitas/kitcode dashboard</code></pre>
    </td>
    <td>
      <img alt="KitCode dashboard" src="../../docs/images/kitcode-dashboard.png" width="560" />
      <br />
      Hosted dashboard: progress, milestones, and reward status from the local tracker.
    </td>
  </tr>
</table>

The tracker serves local data at:

```txt
http://127.0.0.1:4747
```

`track` can run before projects are added. It waits in the background and picks up projects after `add`.

## Daily Use

| Command | What it does |
| --- | --- |
| `kitcode add [path]` | Add a project. Defaults to the current folder. Existing code becomes the baseline. |
| `kitcode remove [path]` | Remove a project and its local contribution data. |
| `kitcode track` | Start the background tracker daemon. |
| `kitcode untrack` | Stop the background tracker. Added projects remain registered. |
| `kitcode list` | Show how many projects are added. |
| `kitcode status` | Show tracker state, project count, and compact reward progress. |
| `kitcode summary` | Show total counted `=`, active time, and next milestone progress. |
| `kitcode awards` | Show reward and milestone readiness. Aliases: `award`, `rewards`. |
| `kitcode terminal` | Open the safe KitCode terminal window and switchable progress views. |
| `kitcode terminal --pet` | Open terminal and the companion pet together. |
| `kitcode pet` | Open the independent desktop companion, defaulting to Pet view. |
| `kitcode setup` | Open KitCode Welcome: projects, auto-track, Mini or Pet preference. |
| `kitcode uninstall` | Remove KitCode hooks, skills, tracker, and all local `~/.kitcode` data. |
| `kitcode dashboard` | Open the hosted dashboard for the running tracker. |
| `kitcode codex on/off/status` | Install, remove, or inspect the Codex hook and skill. |
| `kitcode claude on/off/status` | Install, remove, or inspect the Claude hook and skill. |

Simplest working flow:

```bash
kitcode track
cd your-project
kitcode add .
kitcode terminal
```

Or add first and track later:

```bash
cd your-project
kitcode add .
kitcode track
```

`terminal`, `pet`, and `dashboard` require a running tracker.

## Surfaces

### Terminal

Served at `http://127.0.0.1:4747/terminal`.

View modes:

- **compact** — small bottom-right percent and status
- **progress** — fuller progress panel
- **watch** — watch-style widget

The terminal is a safe command surface. It also exposes a `PET` toggle that opens the companion pet for the current session.

Electron opens the native window when available. Otherwise the CLI falls back to the browser.

### Companion: Mini And Pet

`kitcode pet` and `kitcode setup` open an Electron companion host with two switchable surfaces:

| Surface | Route | Purpose |
| --- | --- | --- |
| Mini | `/companion` | Compact metrics bar: percent, active time, idle time, counted `=` |
| Pet | `/pet` | Animated desktop mascot |

Only one companion surface is visible at a time. The companion is independent from the terminal window, but `kitcode terminal --pet` can open both together.

There is no standalone `kitcode mini` command. Mini is selected inside the companion host or through Welcome setup preferences.

### Setup / Welcome

`kitcode setup` and first-time `codex on` / `claude on` can open the Welcome window.

Welcome lets users:

- pick one or more project folders
- choose whether to auto-start tracking
- choose the default companion view (`mini` or `pet`)

Setup requires the optional Electron dependency.

### Dashboard

`kitcode dashboard` opens the hosted campaign dashboard at `https://kitcode.onedigitas.com/`, which reads from the local tracker API.

Use `--no-open` or `KITCODE_NO_OPEN=1` to skip auto-opening the browser.

## What KitCode Counts

KitCode tracks two ideas: focused time and useful code movement.

### Focus time

A project earns active seconds while it has recent filesystem activity. If a project is quiet for **5 minutes**, new time is recorded as idle time instead of active time.

### Equal count

KitCode scans local source snapshots and counts `=` characters on **real code lines** added after the project baseline.

Rules:

- `kitcode add` creates the baseline snapshot.
- Existing lines at add time do not earn reward by themselves.
- Only lines with enough alphanumeric content count as real code lines.
- Ignored paths include `.git`, `node_modules`, `dist`, `build`, `.next`, `out`, and `coverage`.
- Files larger than 1 MB and binary files are skipped.
- Git Mode attributes new equals to commit batches when possible.
- Vibe Mode attributes new equals to source-change batches.

Example:

```js
const total = price + tax
```

If that line is new after `kitcode add .` and passes the real-code-line check, its `=` characters count toward the ledger.

## Git Mode And Vibe Mode

| Mode | When it happens | What KitCode tracks |
| --- | --- | --- |
| Git Mode | The folder is inside a Git repository. | Commit count, focus time, and source-change batches. |
| Vibe Mode | The folder is not inside a Git repository. | Focus time and source-change batches. |

Both modes use the same `=` counting logic. Git commit totals are telemetry only; reward progress does not depend on branch, merge, or deploy flow.

## Reward Model

Default campaign targets:

- `3600` active seconds (`--reward-seconds`)
- `30` counted `=` (`--reward-equals`)

Each milestone needs both enough active time and enough counted `=`:

- time target for a percent = `ceil(requiredSeconds * percent / 100)`
- equals target comes from the tier table below

### Local reward tiers

Redeemable through `POST /api/reward/redeem` and the dashboard.

| Tier | Code | Required counted `=` |
| ---: | --- | ---: |
| `10%` | `if(tired){return 10;}` | 3 |
| `20%` | `takeBreak(20);` | 6 |
| `30%` | `while(working)break(30);` | 9 |

### Display milestones

Shown in summary/awards/dashboard, but not redeemable unless later backed by campaign flow.

| Milestone | Code | Required counted `=` |
| ---: | --- | ---: |
| `50%` | `mediumStake.unlock(50);` | 12 |
| `100%` | `finalBreak.claim(100);` | 15 |

For valuable `50%` or `100%` rewards, use backend login, consent, and a server-side claim record.

## Codex And Claude Integrations

`kitcode codex on` and `kitcode claude on` install:

- a KitCode skill file
- a `UserPromptSubmit` hook that runs `kitcode hook prompt --source <agent>`
- a durable local runner at `~/.kitcode/bin/kitcode`

The hook:

- runs after each submitted prompt
- fails open and never blocks prompts
- can add compact context: counted `=`, active time, next milestone progress, reward readiness
- can announce newly ready tiers once per agent source

Agents should use `kitcode summary`, `kitcode awards`, and `kitcode status` as the source of truth. They should not calculate or mutate reward state themselves.

Disable hooks with:

```bash
KITCODE_HOOKS_OFF=1
```

## Local State

```txt
~/.kitcode/state.json     Projects, onboarding prefs, reward settings, equals ledger
~/.kitcode/tracker.json   Background tracker PID/host/port metadata
~/.kitcode/hook.log       Hook errors, when logging succeeds
~/.kitcode/bin/kitcode    Durable runner used by agent hooks
```

The equals ledger lives inside `state.json` and tracks per-project counted commits/batches plus redeemed tiers.

## Privacy

KitCode is local-first.

By default it does not send:

- source code
- raw diffs
- arbitrary file contents
- full local paths
- project names
- commit metadata

The local API returns aggregate values only:

- active and idle time
- added project count
- commit count
- change batch count
- total counted `=`
- break progress and tier state

## API

```txt
GET  /api/health
GET  /api/summary
GET  /api/projects
GET  /api/events
GET  /terminal
GET  /pet
GET  /companion
GET  /pet-assets/kit-terminal/spritesheet.webp
GET  /pet-assets/kit-terminal/pet.json
POST /api/reward/redeem
```

`/api/events` is a Server-Sent Events stream that emits `summary` every second.

`POST /api/reward/redeem` accepts an optional JSON body:

```json
{ "tier": 10 }
```

If `tier` is omitted, all ready local tiers are redeemed.

These legacy endpoints return `410 Gone`:

```txt
GET  /api/projects/:id/commits
POST /api/projects/:id/start
POST /api/projects/:id/stop
POST /api/projects/selection
```

## Options And Environment

```bash
kitcode track --host 127.0.0.1
kitcode track --port 4757
kitcode track --reward-seconds 3600
kitcode track --reward-equals 30
kitcode terminal --pet
kitcode dashboard --no-open
```

Environment variables:

| Variable | Effect |
| --- | --- |
| `KITCODE_REWARD_SECONDS` | Override default reward time target |
| `KITCODE_REWARD_EQUALS` | Override default reward equals target |
| `KITCODE_ALLOWED_ORIGINS` | Comma-separated extra CORS origins for the local API |
| `KITCODE_NO_OPEN` | Skip auto-opening the hosted dashboard |
| `KITCODE_HOOKS_OFF` | Disable prompt hook side effects |
| `KITCODE_DAEMON` | Internal flag used by the background tracker process |

Example for another hosted dashboard origin:

```bash
KITCODE_ALLOWED_ORIGINS=https://your-kitcode-web.example npx @onedigitas/kitcode track
```

Default allowed origins already include:

- `https://kitcode.onedigitas.com`
- local Vite dev hosts on ports `3000`, `5173`, and `8686`

## What This Package Owns

The CLI is the source of truth for:

- local tracking
- local reward eligibility
- claim / redeem state
- hook output
- local terminal and companion surfaces
- local dashboard data

Skills and hooks should only surface CLI context. They should not calculate rewards, mutate the ledger, or decide voucher eligibility themselves.

## Requirements

- Node.js 20+
- Git is optional, but enables Git Mode for repositories
- Electron is optional, but required for native Terminal, Pet, Mini, and Welcome windows

## Publishing

From the repository root, bump the package version:

```bash
npm version patch -w @onedigitas/kitcode --no-git-tag-version
```

Then update the `VERSION` constant in `packages/kitcode-cli/bin/kitcode.mjs` to match `packages/kitcode-cli/package.json`.

Verify and publish:

```bash
npm run lint
npm run pack:cli
npm run publish:cli
```

After publish, confirm the registry version:

```bash
npm view @onedigitas/kitcode version
npx @onedigitas/kitcode --version
```
