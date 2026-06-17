#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Missing .env — run setup-jandt.sh first."
  exit 1
fi

export PATH="${HOME}/.fly/bin:${PATH}"

if ! command -v fly >/dev/null 2>&1; then
  echo "Installing Fly.io CLI…"
  curl -L https://fly.io/install.sh | sh
  export PATH="${HOME}/.fly/bin:${PATH}"
fi

if ! fly auth whoami >/dev/null 2>&1; then
  echo "Log in to Fly.io (browser will open)…"
  fly auth login
fi

if ! fly apps list 2>/dev/null | grep -q "jandt-slack-bot"; then
  echo "Creating Fly app jandt-slack-bot…"
  fly apps create jandt-slack-bot --org personal 2>/dev/null || fly apps create jandt-slack-bot
fi

echo "Uploading secrets from .env…"
grep -v '^#' .env | grep -v '^$' | fly secrets import

echo "Deploying…"
fly deploy --ha=false

echo ""
echo "Bot is live on Fly.io. Check: fly logs"
echo "Stop local bot if it's still running (npm start in Terminal)."
