# KitCode Campaign Summary

## Campaign Positioning

KitCode is best positioned as a lightweight break-reminder and reward campaign for developers, inspired by the core KitKat insight: **"Have a break, have a KitKat."**

The core campaign idea:

- Encourage developers to pause after meaningful coding sessions.
- Turn coding effort into timely break moments.
- Reward healthy work rhythm with small KitKat-style gifts or voucher milestones.
- Make the experience feel local, playful, and privacy-friendly.
- Support both Codex and Claude users through soft prompt hooks that remind them when it is time to take a break.
- Use the web dashboard as the campaign surface for break progress, reward unlocks, and redemption.

The campaign should not sound like "code more to earn more." It should sound like "you have been focused long enough; take a break and enjoy a KitKat."

The current implementation is strong for a low-stakes internal campaign, hackathon, developer activation, or brand engagement mechanic. It is not designed to prevent determined cheating when real monetary value is attached.

## Campaign Flow

1. A developer runs `kitcode` in a project folder.
2. KitCode starts a local server on `127.0.0.1:4747`.
3. The server tracks aggregate activity such as active time, idle time, commit count, shipped `=`, and break reward progress.
4. The web dashboard reads the local server and shows when the developer is approaching a break milestone.
5. Codex and Claude hooks gently remind the user when a KitKat break reward is ready.
6. The user takes a break and redeems the unlocked gift or voucher tier with `kitcode redeem`.

Default reward targets:

- `3600` seconds of active time.
- `30` shipped `=` total.
- Voucher tiers at `10%`, `20%`, and `30%`.

Note: these numbers are currently best understood as a fast dev-test simulation, so the team can quickly test the unlock and redemption loop. Real campaign thresholds should be set separately based on campaign duration, reward value, and validation model.

## Campaign Strengths

- Very easy to try with `npx kitcode`.
- Local-first setup feels privacy-friendly.
- Works with both Git repositories and non-Git folders.
- Hooks integrate directly into Codex and Claude workflows as soft reminders.
- The break reward mechanic maps naturally to the KitKat brand idea.
- Dashboard can become a strong visual campaign touchpoint.
- Only aggregate data is exposed, so users do not need to share source code.

## What The Codex And Claude Hooks Do

The hooks are designed as a light engagement layer, not as a control or enforcement system.

What they do:

- Run on the `UserPromptSubmit` event.
- Check whether a break reward milestone is ready.
- Add a short context reminder when a reward is available.
- Try to show a best-effort desktop notification.
- Tell the user they can run `kitcode redeem` after the turn.

What they do not do:

- They do not block the user's prompt.
- They do not read or send source code.
- They do not decide final voucher eligibility.
- They do not prevent cheating by themselves.
- They do not force the user to take a break.

In campaign language, the hooks are the "Have a break" nudge inside the developer's AI workflow. The dashboard and backend should handle progress display and reward validation.

## Main Campaign Risk

KitCode trusts the local machine.

That is acceptable for a friendly campaign where rewards are small, symbolic, or manually reviewed. It is risky if vouchers have meaningful monetary value and redemption is fully automatic.

## Cheat Risk Table

| Area | Risk level | How it can be cheated | Campaign impact | Mitigation |
| --- | --- | --- | --- | --- |
| Local state `~/.kitcode` | High | User edits local state to inflate active time, shipped `=`, or reward status. | Break rewards may unlock without real participation. | Do not issue real vouchers from local state alone; verify redemption on a backend. |
| Reward thresholds | High | User lowers `rewardSeconds` or `rewardEquals` through config/options. | Break milestones become easier than intended. | Control thresholds through server-side or signed campaign config. |
| Shipped `=` metric | High | User adds many low-value code lines containing `=`. | The work signal can be gamed and may not reflect a real focused session. | Treat `=` as a playful engagement signal, not proof of work; combine with review or remote validation. |
| Fake or low-value commits | Medium to high | User creates many small, local-only, or meaningless commits. | Commit count and shipped signal can be inflated to claim break rewards. | Require commits to be pushed to a real remote and check suspicious patterns. |
| Artificial activity | Medium | Scripts or file changes keep the watcher active. | Break eligibility can be inflated. | Add sanity checks, rate limits, and detection for unusually fast unlocks. |
| Local API spoofing | Medium | User runs a fake service at `127.0.0.1:4747`. | Dashboard can display fake break progress. | Treat dashboard progress as local-only; verify rewards through backend. |
| Hook bypass | Low to medium | User disables or removes Codex/Claude hooks. | Reminders disappear, but tracking still works. | Treat hooks as engagement, not enforcement. |
| Voucher code exposure | Medium | Real voucher codes in local package source can be discovered. | Codes can leak or be shared outside the campaign. | Issue real voucher codes only from a secure backend. |

## Recommended Campaign Framing

Use KitCode as:

- A branded break companion for developers.
- A reminder to pause after focused coding.
- A lightweight KitKat reward unlock experience.
- A campaign companion for Codex and Claude users.

Do not frame KitCode as:

- A campaign that pushes developers to overwork.
- A secure proof-of-work system.
- A fraud-resistant voucher platform.
- A reliable measurement of code quality.
- A replacement for server-side reward validation.

## Recommended Anti-Cheat Improvements

### Low-Stakes Campaigns

Use this model when the reward is symbolic, low-value, internal, or mostly for engagement.

Examples:

- Small KitKat gift redemption.
- Internal hackathon perk.
- Limited brand activation with manual review.
- Non-cash badge, coupon, or playful code.

Recommended controls:

- Keep voucher value low.
- Make campaign terms clear: rewards may be reviewed.
- Add basic sanity checks for extreme activity.
- Show progress as local or estimated progress.
- Avoid promising automatic guaranteed rewards.

### Medium-Stakes Campaigns

Use this model when the reward has real value, but the risk is manageable with lightweight verification.

Examples:

- Larger voucher amount.
- Public campaign with many participants.
- Rewards limited per person or per campaign period.
- Campaign where fraud would create cost or PR risk, but not severe financial exposure.

Recommended controls:

- Require sign-in.
- Send anonymized progress events to a campaign backend.
- Issue voucher codes from the backend, not local code.
- Validate realistic activity windows.
- Require remote Git provider verification.
- Rate-limit redemption by account, machine, and campaign period.

### High-Stakes Campaigns

Use this model when rewards have meaningful monetary value, scale is large, or abuse would create serious financial, legal, or reputational risk.

Examples:

- High-value vouchers.
- Cash-like rewards.
- Large public campaign.
- Automated redemption without human review.
- Partner-funded campaign where every redemption has real cost.

Recommended controls:

- Server-controlled campaign configuration.
- Signed local events.
- Backend reward eligibility calculation.
- Remote repository verification.
- Abuse detection.
- One-time voucher issuance from a secure backend.
- Manual review for unusual activity.

## Practical Recommendation

The best model for the current product shape:

1. Local dashboard tracks focus and break progress.
2. Hooks create timely "have a break" reminders inside Codex and Claude.
3. The local CLI unlocks candidate reward eligibility.
4. A backend verifies and issues real KitKat gift or voucher codes.
5. Campaign copy centers rest, not productivity pressure.
6. Campaign copy avoids overclaiming security.

This keeps the experience simple and fun while avoiding the biggest risk: treating local-only data as fraud-proof evidence.

## Suggested Campaign Copy

Short version:

> Have a break, have a KitKat. KitCode notices when you have been in focus mode and reminds you to pause, recharge, and claim a small reward.

Developer version:

> KitCode turns focused coding sessions into well-timed KitKat breaks. Track local activity, unlock break rewards, and get soft reminders inside Codex or Claude when it is time to step away.

Security-aware version:

> KitCode provides local progress tracking for break-based campaign engagement. Final reward eligibility may be reviewed or verified before gift or voucher issuance.

## Simplest User Setup

```bash
npx kitcode
npx kitcode codex on
npx kitcode claude on
```

Then open:

```txt
https://kitcode.vercel.app/
```
