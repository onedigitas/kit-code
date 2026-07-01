# KitCode

<p align="center">
  <img alt="KitCode logo mark" src="https://img.shields.io/badge/KitCode-Have%20a%20break-8BC34A?style=for-the-badge&labelColor=0A0A0A" />
  <img alt="Local first" src="https://img.shields.io/badge/Local--first-Privacy%20friendly-111111?style=for-the-badge&labelColor=8BC34A" />
  <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20%2B-FFFFFF?style=for-the-badge&labelColor=111111" />
</p>

<p align="center">
  <strong>A lightweight break companion for developers.</strong><br />
  Track focused coding activity locally, unlock KitKat-style break rewards, and get soft reminders inside Codex or Claude when it is time to pause.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#how-it-works">How It Works</a>
  ·
  <a href="#privacy">Privacy</a>
  ·
  <a href="#campaign-readiness">Campaign Readiness</a>
</p>

---

## Product Snapshot

| Surface | What it does | Why it matters |
| --- | --- | --- |
| Local CLI | Starts a local KitCode server for the current folder. | Developers can try it with one command. |
| Web dashboard | Shows aggregate activity, break progress, and reward unlocks. | The campaign has a clear visual home. |
| Codex hook | Adds a gentle reminder when a reward milestone is ready. | Break nudges appear inside the developer workflow. |
| Claude hook | Mirrors the same lightweight reminder behavior for Claude users. | The experience works across common AI coding tools. |
| Local API | Exposes summary progress on `127.0.0.1:4747`. | The dashboard can read progress without source-code access. |

KitCode is meant to feel like:

- A friendly nudge to pause after a focused session.
- A playful KitKat campaign layer for developers.
- A local-first progress tracker, not a surveillance tool.
- A low-friction activation for internal campaigns, hackathons, and brand demos.

It should not be framed as "code more to earn more." The healthier message is:

> You have been focused long enough. Take a break and enjoy a KitKat.

## Quick Start

Run KitCode from a project folder:

```bash
npx @onedigitas/kitcode
```

Turn on AI workflow reminders:

```bash
npx @onedigitas/kitcode codex on
npx @onedigitas/kitcode claude on
```

Open the dashboard:

```txt
https://kitcode.vercel.app/
```

The default server runs on:

```txt
http://127.0.0.1:4747
```

## How It Works

```txt
Developer folder
    |
    |  npx @onedigitas/kitcode
    v
Local KitCode server
    |
    |  aggregate activity only
    v
Web dashboard
    |
    |  milestone ready
    v
Codex / Claude reminder
    |
    |  kitcode redeem
    v
Break reward flow
```

1. The developer starts KitCode in a project folder.
2. KitCode starts or reuses a local server on `127.0.0.1:4747`.
3. The server tracks aggregate activity such as active time, idle time, commit count, change batches, shipped `=`, and reward progress.
4. The dashboard reads the local API and visualizes progress.
5. Codex and Claude hooks gently remind the developer when a break milestone is ready.
6. The developer can redeem an unlocked reward tier with `kitcode redeem`.

## Dashboard Feel

The current UI direction is terminal-inspired: dark panels, matcha green highlights, compact status bars, and developer-native language.

| Token | Value |
| --- | --- |
| Background | `#0A0A0A` |
| Panel | `#111111` |
| Accent | `#8BC34A` |
| Text | `#A6A6A6` / `#FFFFFF` |
| Style | Terminal dashboard, Vim-like status line, compact cards |

## Commands

```bash
kitcode serve
kitcode serve --port 4757
kitcode serve --reward-seconds 3600
kitcode serve --reward-equals 30

kitcode add .
kitcode add /path/to/project
kitcode list
kitcode remove .
kitcode remove /path/to/project

kitcode break
kitcode reward
kitcode redeem
kitcode redeem --tier 10

kitcode codex on
kitcode codex status
kitcode claude on
kitcode claude status

kitcode stop
kitcode start
```

## API

```txt
GET  /api/health
GET  /api/summary
GET  /api/projects
GET  /api/events
POST /api/reward/redeem
```

Project-level mutation and commit-detail endpoints return `410 Gone`.

## Default Reward Targets

| Target | Default |
| --- | ---: |
| Active time | `3600` seconds |
| Shipped `=` total | `30` |
| Voucher tiers | `10%`, `20%`, `30%` |

These values are currently useful for development and campaign simulation. Real campaign thresholds should be set separately based on campaign duration, reward value, and validation requirements.

## Privacy

KitCode is local-first. The local server does not expose raw source code, repo paths, project names, project ids, commit metadata, or arbitrary file-read endpoints.

The API returns aggregate values only:

- Total active and idle time.
- Active folder count.
- Total commit count.
- Total change batch count.
- Total shipped `=` count.
- Reward progress.

The default CORS allowlist includes localhost development origins and:

```txt
https://kitcode.vercel.app
```

To allow another hosted dashboard origin:

```bash
KITCODE_ALLOWED_ORIGINS=https://your-kitcode-web.example npx @onedigitas/kitcode serve
```

## Codex And Claude Hooks

The hooks are a lightweight engagement layer, not an enforcement system.

They do:

- Run on the `UserPromptSubmit` event.
- Check whether a reward milestone is ready.
- Add a short context reminder when a reward is available.
- Try to show a best-effort desktop notification.
- Tell the developer they can run `kitcode redeem` after the turn.

They do not:

- Block prompts.
- Read or send source code.
- Decide final voucher eligibility.
- Prevent cheating by themselves.
- Force anyone to take a break.

## Campaign Readiness

KitCode is strongest for low-stakes developer engagement:

| Good fit | Use with care |
| --- | --- |
| Internal hackathons | High-value vouchers |
| Small KitKat gift redemption | Cash-like rewards |
| Developer brand activation | Large public campaigns |
| Manual or reviewed rewards | Fully automatic redemption |
| Non-cash badges or playful codes | Fraud-resistant proof-of-work claims |

The main risk is simple: KitCode trusts the local machine. That is acceptable for friendly, low-value, or manually reviewed campaigns. It is not enough for meaningful monetary rewards without backend validation.

## Security Notes

| Area | Risk | Recommended control |
| --- | --- | --- |
| Local state in `~/.kitcode` | Users can edit local progress. | Verify real rewards on a backend. |
| Reward thresholds | Local options can lower unlock requirements. | Use server-controlled or signed campaign config. |
| Shipped `=` metric | The signal can be gamed. | Treat it as playful engagement, not proof of work. |
| Artificial activity | Scripts can inflate local activity. | Add sanity checks, rate limits, and anomaly review. |
| Voucher exposure | Local voucher codes can leak. | Issue real codes from a secure backend only. |

## Recommended Production Model

1. The local dashboard tracks focus and estimated break progress.
2. Codex and Claude hooks provide timely "have a break" reminders.
3. The local CLI unlocks candidate reward eligibility.
4. A backend verifies eligibility and issues real KitKat gifts or voucher codes.
5. Campaign copy centers rest and recovery, not productivity pressure.
6. Security claims stay honest: local progress is useful, but not fraud-proof.

## Requirements

- Node.js 20+
- Git for Git Mode

## Workspace

```txt
apps/web                 Web dashboard
packages/kitcode-cli     Local CLI, server, hooks, and API
```

Root scripts:

```bash
npm run dev
npm run build
npm run lint
npm run pack:cli
```
