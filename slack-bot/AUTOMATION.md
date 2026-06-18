# Cursor Automation — Slack → live site

**Full agent prompt:** copy from [`AGENT-INSTRUCTIONS.md`](./AGENT-INSTRUCTIONS.md) into your automation.

That prompt makes the Slack agent behave like prompting in Cursor IDE — explore the repo, edit the right CMS layer, build, push, and run `publish-sync` for live content.

## Quick reference

| Layer | What | Visitors see it when |
|-------|------|----------------------|
| Base44 SiteContent | Live CMS JSON | After `npm run publish-sync` |
| GitHub main | Code + defaultSite | After Base44.com Publish |

## Automation settings

| Field | Value |
|-------|--------|
| Trigger | Slack → `#jandt-edits` → **Anyone in the channel** |
| Repo | `pwslcc24-hash/JandT` → **main** |
| Tools | **Send to Slack** only — remove "Open pull request" |
| Model | Codex 5.3 High |

## Jay

Posts in `#jandt-edits` (no @, no Cursor account):

> make the hero countdown say days until forever
