#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/slack-bot/.env"

echo ""
echo "=== Slack site editor setup ==="
echo ""
echo "Open these in your browser (if not already):"
echo "  Slack app:  https://api.slack.com/apps"
echo "  Cursor key: https://cursor.com/dashboard/integrations"
echo ""
open "https://api.slack.com/apps" 2>/dev/null || true
open "https://cursor.com/dashboard/integrations" 2>/dev/null || true

echo "Paste each value when asked (from Slack app + Cursor dashboard)."
echo ""

read -r -p "CURSOR_API_KEY (cursor_...): " CURSOR_API_KEY
read -r -p "SLACK_BOT_TOKEN (xoxb-...): " SLACK_BOT_TOKEN
read -r -p "SLACK_APP_TOKEN (xapp-...): " SLACK_APP_TOKEN
read -r -p "SLACK_SIGNING_SECRET: " SLACK_SIGNING_SECRET
read -r -p "Your Slack member ID (U...): " ALLOWED_SLACK_USER_IDS

for v in CURSOR_API_KEY SLACK_BOT_TOKEN SLACK_APP_TOKEN SLACK_SIGNING_SECRET ALLOWED_SLACK_USER_IDS; do
  if [[ -z "${!v:-}" ]]; then
    echo "Missing $v. Run again when you have all values."
    exit 1
  fi
done

cat > "$ENV_FILE" <<EOF
CURSOR_API_KEY=$CURSOR_API_KEY
SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN
SLACK_APP_TOKEN=$SLACK_APP_TOKEN
SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET
ALLOWED_SLACK_USER_IDS=$ALLOWED_SLACK_USER_IDS
GITHUB_REPO_URL=https://github.com/pwslcc24-hash/JandT
GITHUB_BRANCH=main
GIT_MODE=main
EOF

echo ""
echo "Wrote $ENV_FILE"
echo "Installing…"
(cd "$ROOT/slack-bot" && npm install)

echo ""
echo "Starting bot… (leave this window open)"
echo "Then DM your bot in Slack with: Make the hero text bigger"
echo ""
cd "$ROOT/slack-bot" && npm start
