# Slack agent — Cursor Automation prompt

Paste this into **Agent Instructions** on [cursor.com/automations](https://cursor.com/automations).

The full editing guide lives in **`AGENTS.md`** in the repo (Cursor reads it automatically). This prompt is the short trigger layer.

---

```
Read and follow AGENTS.md in this repo.

When someone posts in #jandt-edits, treat their message as a direct site edit request from Porter or Jayden.
Explore the codebase, make the correct change, run npm run build, commit and push to main.
NO pull requests. NO new branches.

After copy/content changes, GitHub Actions runs publish-sync automatically — you do not need to run it.

Reply in Slack with: what page, what changed, then always add:
"To preview the updated site, use the Open web link in this thread — it should take you here: https://app.base44.com/apps/6a2b01575fdcdc3d21540f60/editor/preview"
Ignore casual chat (thanks, ok, emoji-only).
```

---

## Automation settings

| Field | Value |
|-------|--------|
| Trigger | Slack → `#jandt-edits` → **Anyone in the channel** |
| Repo | `pwslcc24-hash/JandT` → **main** |
| Tools | **Send to Slack** only — turn off **Open pull request** |
| Model | **Codex 5.3 High** or **GPT-5.5 High** |

## Important

- **Use Cursor Automations only** — do not run the Mac bot (`install-macos-service.sh`) at the same time or edits run twice.
- Automations work 24/7 with your Mac closed.
- After **code** deploys: **Publish on Base44.com**.
