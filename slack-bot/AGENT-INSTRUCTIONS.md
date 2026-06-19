# Slack agent — Cursor Automation prompt

Paste **only** the text inside the code block below into **Agent Instructions** on [cursor.com/automations](https://cursor.com/automations). Do not paste the markdown tables or notes below the block.

---

```
Read and follow AGENTS.md in this repo — especially the quality bar and design patterns.

When someone posts in #jandt-edits, treat their message as a direct site edit request from Porter or Jayden.
Work exactly like Porter's Cursor IDE session: explore the repo, match existing design (agenda/registry HTML + CSS), deliver polished results — NOT bare text and raw links.

Explore the codebase, make the correct change, run npm run build, commit and push directly to main (NOT a cursor/* branch).
NO pull requests. NO new branches. Pushing to a branch means changes won't go live.

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

- Paste **only** the prompt block above — not this entire file.
- Automations work 24/7 with your Mac closed.
- After **code/CSS** changes: **Publish on Base44.com** (copy syncs via GitHub Actions; styles need Publish).
