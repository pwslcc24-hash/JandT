# Cursor Automation — Slack → live site

Jay posts in `#jandt-edits` → **Cursor Automation** (cloud) edits the repo → pushes to `main` → GitHub Actions syncs live content.

No bot server. No Mac awake. No Slack app tokens.

## Setup (one time)

1. **Channel:** `#jandt-edits` must be **public** (Cursor Automations requirement).
2. **Automation:** [cursor.com/automations](https://cursor.com/automations) → create or edit **Salckbot JandT**
3. **Prompt:** copy from [`AGENT-INSTRUCTIONS.md`](./AGENT-INSTRUCTIONS.md)
4. **Rules:** [`AGENTS.md`](../AGENTS.md) in the repo (Cursor reads it automatically)

## What happens on each edit

| Step | Who |
|------|-----|
| Jay posts in Slack | Jay |
| Cursor agent edits + pushes `main` | Cursor Automation |
| `publish-sync` → Base44 SiteContent | GitHub Actions |
| Code/CSS deploy | **Publish** on Base44.com |

## Test

Post in `#jandt-edits`:

> make the hero countdown say days until forever

Cursor replies in the thread. Check GitHub for a commit on `main`.
