# Edit the site from anywhere

**Easiest (recommended):** skip Slack. One API key, two ways to edit.

## Setup (once, ~2 minutes)

```bash
chmod +x slack-bot/setup.sh
./slack-bot/setup.sh
```

Paste your [Cursor API key](https://cursor.com/dashboard/integrations). The script saves it locally and to GitHub Actions.

Also connect **GitHub** to your Cursor team so cloud agents can push to `pwslcc24-hash/JandT`.

## Edit from your Mac

```bash
cd slack-bot
npm run edit -- "Make the hero countdown say days until forever"
```

Cursor clones the repo, makes the change, runs `npm run build`, and pushes to `main`.

## Edit from your phone

No Slack, no server running:

1. Open the **GitHub** app
2. Go to **pwslcc24-hash/JandT** → **Actions** → **Site edit**
3. **Run workflow** → type what you want changed → **Run**

Then **Publish on Base44.com** for the live site.

---

## Optional: Slack bot

Only if you want `@mention` edits in Slack. Needs a [Slack app](https://api.slack.com/apps) (Socket Mode + bot token). Add to `.env`:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_SIGNING_SECRET=...
ALLOWED_SLACK_USER_IDS=U01234567
```

Then `npm start` in `slack-bot/` (must stay running).

### Slack app checklist

- Socket Mode on → app token `connections:write`
- Bot scopes: `app_mentions:read`, `chat:write`, `im:history`, `im:read`, `im:write`, `commands`
- Events: `app_mention`, `message.im`
- Slash command: `/site-edit` (optional)

## Env vars

| Variable | Required | Notes |
|----------|----------|-------|
| `CURSOR_API_KEY` | Yes | Cursor dashboard → Integrations |
| `GITHUB_REPO_URL` | No | Defaults to this repo |
| `GIT_MODE` | No | `main` (default) or `pr` |

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing CURSOR_API_KEY` | Run `./slack-bot/setup.sh` |
| `integration is not connected` | Connect GitHub in Cursor team settings |
| GitHub Action fails | Repo → Settings → Secrets → confirm `CURSOR_API_KEY` exists |
