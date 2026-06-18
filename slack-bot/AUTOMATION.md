# Cursor Automation — Slack → live site

## Why Slack said "done" but nothing changed

The site has **two layers**:

| Layer | What it is | Who sees it |
|-------|------------|-------------|
| **GitHub** (`defaultSite.ts`) | Code / fallbacks | After Base44 **Publish** |
| **Base44 SiteContent** | Live CMS data | **Visitors immediately** |

Jay's registry edit **did reach GitHub** (commit `Update registry tab with Amazon link and Venmo handle`).

But the live site reads **Base44 SiteContent**, which still had the old text. The agent only updated fallbacks.

**Fix applied:** registry content pushed to Base44 SiteContent.

---

## Automation Agent Instructions (use this)

```
IMPORTANT: This site stores LIVE content in Base44 SiteContent, not just git files.

When someone posts a site change in #jandt-edits:

1. Edit src/cms/seed/defaultSite.ts for the right page (pageContent blocks).
   Also update src/config/wedding.js fallbacks if needed.
2. Run npm run build and fix errors.
3. Commit and push to main (no PR, no new branch).
4. CRITICAL — run: cd slack-bot && npm run publish-sync
   This pushes content to Base44 so visitors actually see the change.
5. Reply in Slack with what you changed.

Do NOT open a pull request. Do NOT create a new branch.

Ignore casual messages (thanks, ok, lol).
```

## Automation settings

| Field | Value |
|-------|--------|
| Trigger | Slack → `#jandt-edits` → **Anyone in the channel** |
| Repo | `pwslcc24-hash/JandT` → **main** |
| Tools | **Send to Slack** only — remove "Open pull request" |
| Model | Codex 5.3 High |

## After GitHub changes

**Publish on Base44.com** when code (not just text) changed.

## Jay

Posts in `#jandt-edits`:

> make the hero countdown say days until forever
