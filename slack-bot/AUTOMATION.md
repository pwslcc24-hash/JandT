# Cursor Automation — Slack → main

## Automation settings ([cursor.com/automations](https://cursor.com/automations))

| Field | Value |
|-------|--------|
| Trigger | Slack → New message → `#jandt-edits` → **Anyone in the channel** |
| Repository | `pwslcc24-hash/JandT` → **main** |
| Tools | **Send to Slack** only — **remove** “Open pull request” |
| Status | **Active** |

Slack: `/invite @Cursor` in `#jandt-edits`

## Agent Instructions (paste this)

```
IMPORTANT: Do NOT open a pull request. Do NOT create a new branch.
Commit and push directly to the main branch every time.

You edit the Holdsworth wedding website (React + Vite + Base44).

When someone posts in #jandt-edits, treat their message as a site change request.

Rules:
- Make the smallest correct change.
- Paths: src/cms/, src/pages/, src/index.css, src/styles/editor.css
- Match existing code style.
- Run npm run build and fix errors.
- git add, git commit, git push origin main (no PR, no new branch).
- Reply in Slack with what you changed.

Ignore casual messages (thanks, ok, lol).
```

## Cursor defaults

1. [cursor.com/dashboard](https://cursor.com/dashboard) → **Cloud Agents** → **Defaults** → disable auto-open PR if shown
2. Cursor app → **Settings** → **Features** → **Git** → clear **Branch prefix** (`cursor/`)

## Fallback: auto-merge PRs

If Cursor still opens PRs, this repo merges `cursor/*` branches to `main` automatically via `.github/workflows/auto-merge-cursor-prs.yml`.

## After changes

**Publish on Base44.com** for the live site.

## Jay

Posts in `#jandt-edits` (no @, no Cursor account):

> make the hero countdown say days until forever
