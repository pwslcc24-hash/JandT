#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/.env"

echo ""
echo "=== JandT: Jay suggests in Slack → your Cursor edits the site ==="
echo ""

open "https://api.slack.com/apps" 2>/dev/null || true
open "https://cursor.com/dashboard/integrations" 2>/dev/null || true

if [[ -f "$ENV_FILE" ]]; then
  echo "Using existing $ENV_FILE"
else
  echo "Paste values (see SLACK-SETUP.md for where to get each):"
  echo ""
  read -r -p "CURSOR_API_KEY: " CURSOR_API_KEY
  read -r -p "SLACK_BOT_TOKEN (xoxb-...): " SLACK_BOT_TOKEN
  read -r -p "SLACK_APP_TOKEN (xapp-...): " SLACK_APP_TOKEN
  read -r -p "SLACK_SIGNING_SECRET: " SLACK_SIGNING_SECRET
  read -r -p "Your Slack member ID (U...): " PORTER_ID
  read -r -p "Jay email [holdsjay@gmail.com]: " JAY_EMAIL
  JAY_EMAIL="${JAY_EMAIL:-holdsjay@gmail.com}"

  cat > "$ENV_FILE" <<EOF
CURSOR_API_KEY=$CURSOR_API_KEY
SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN
SLACK_APP_TOKEN=$SLACK_APP_TOKEN
SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET
ALLOWED_SLACK_USER_IDS=$PORTER_ID
SLACK_EDIT_CHANNEL=jandt-edits
SLACK_INVITE_EMAIL=$JAY_EMAIL
GITHUB_REPO_URL=https://github.com/pwslcc24-hash/JandT
GITHUB_BRANCH=main
GIT_MODE=main
EOF
fi

echo ""
echo "Invite holdsjay@gmail.com in Slack (Invite people), then press Enter…"
read -r _

cd "$ROOT"
npm install
npm run provision

echo ""
echo "After Jay joins Slack, add his member ID to ALLOWED_SLACK_USER_IDS in .env"
echo "Then: npm run provision && npm start"
echo ""
