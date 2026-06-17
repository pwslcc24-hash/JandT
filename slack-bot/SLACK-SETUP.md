# Jay → Slack → Porter's Cursor → GitHub

Jay posts suggestions in `#jandt-edits`. Your bot runs on **your** `CURSOR_API_KEY` and pushes to `main`.

## 1. Create a Slack app (one time)

[api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch** → name: `JandT Site Bot`

### Socket Mode
- **ON** → create token with `connections:write` → `SLACK_APP_TOKEN`

### Bot Token Scopes
`OAuth & Permissions` → add:
- `channels:history`
- `channels:read`
- `channels:join`
- `channels:manage`
- `chat:write`
- `users:read`
- `users:read.email`

### Events
`Event Subscriptions` → **ON** → Bot events:
- `message.channels`

### Install
**Install App** → copy `SLACK_BOT_TOKEN` and **Signing Secret**

## 2. Configure `.env`

```bash
cd slack-bot
cp .env.example .env
# fill in CURSOR_API_KEY, Slack tokens, your Slack member ID
```

Your member ID: Slack profile → ⋮ → **Copy member ID**

## 3. Invite Jay to Slack

Slack → **Invite people** → `holdsjay@gmail.com`

(Workspace invite — the bot cannot do this step.)

## 4. Create channel + invite Jay

```bash
npm install
npm run provision
```

Adds Jay to `#jandt-edits` if he's already in the workspace. Copy `SLACK_EDIT_CHANNEL_ID` into `.env` if printed.

## 5. Add Jay's Slack ID to allowlist

After Jay joins: his profile → ⋮ → **Copy member ID** → add to `ALLOWED_SLACK_USER_IDS` in `.env` (comma after yours).

Run `npm run provision` again to add him to the channel.

## 6. Run the bot (keep terminal open)

```bash
npm start
```

## Jay's instructions

In `#jandt-edits`, just type:

> make the hero countdown say days until forever

No `@`, no Cursor account needed.
