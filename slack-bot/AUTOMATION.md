# Cursor Automation — Slack → live site (24/7, no Mac)

Jay posts in `#jandt-edits` → **Cursor Automation** (cloud) edits the repo → pushes to `main` → GitHub Actions syncs live content.

**No hosting. No Mac awake. No credit card.**

## Setup (one time)

1. **Channel:** `#jandt-edits` must be **public** (Cursor Automations requirement). Jay is in the channel.
2. **Automation:** [cursor.com/automations](https://cursor.com/automations) → New
3. **Prompt:** copy from [`AGENT-INSTRUCTIONS.md`](./AGENT-INSTRUCTIONS.md)
4. **Full rules:** already in repo root [`AGENTS.md`](../AGENTS.md) — cloud agent reads this automatically
5. **Do NOT** run the Mac bot at the same time:
   ```bash
   launchctl bootout gui/$(id -u)/com.jandt.slack-bot
   ```

## What happens on each edit

| Step | Who |
|------|-----|
| Jay posts in Slack | Jay |
| Cursor agent edits + pushes `main` | Cursor Automation (cloud) |
| `publish-sync` → Base44 SiteContent | GitHub Actions (automatic) |
| Code deploy to live URL | Porter → Publish on Base44.com |

## Automation settings

| Field | Value |
|-------|--------|
| Trigger | Slack → `#jandt-edits` → **Anyone in the channel** |
| Repo | `pwslcc24-hash/JandT` → **main** |
| Tools | **Send to Slack** only — remove "Open pull request" |

## Test

Post in `#jandt-edits`:

> make the hero countdown say days until forever

Cursor replies in the thread. Check GitHub for a commit on `main`.
