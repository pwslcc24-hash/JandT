#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/automation/.env"
REPO="pwslcc24-hash/JandT"

echo ""
echo "=== JandT site editor — setup ==="
echo ""
echo "1) Open Cursor → Dashboard → Integrations → create an API key"
echo "   https://cursor.com/dashboard/integrations"
echo ""
echo "2) Make sure GitHub repo is connected in Cursor (team GitHub integration)"
echo ""

if [[ -f "$ENV_FILE" ]] && grep -q "CURSOR_API_KEY=." "$ENV_FILE" 2>/dev/null; then
  echo "Found existing automation/.env — updating GitHub secret only."
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  read -r -p "Paste your CURSOR_API_KEY: " CURSOR_API_KEY
  if [[ -z "${CURSOR_API_KEY:-}" ]]; then
    echo "No key entered. Exiting."
    exit 1
  fi

  cat > "$ENV_FILE" <<EOF
CURSOR_API_KEY=$CURSOR_API_KEY
GITHUB_REPO_URL=https://github.com/$REPO
GITHUB_BRANCH=main
GIT_MODE=main
EOF
  echo "Wrote $ENV_FILE"
fi

if [[ -z "${CURSOR_API_KEY:-}" ]]; then
  CURSOR_API_KEY="$(grep '^CURSOR_API_KEY=' "$ENV_FILE" | cut -d= -f2-)"
fi

echo ""
echo "Saving CURSOR_API_KEY to GitHub Actions secrets…"
gh secret set CURSOR_API_KEY --body "$CURSOR_API_KEY" --repo "$REPO"

echo ""
echo "Installing dependencies…"
(cd "$ROOT/automation" && npm install)

echo ""
echo "=== You're set ==="
echo ""
echo "Slack edits: Cursor Automation on #jandt-edits (see automation/AUTOMATION.md)"
echo ""
echo "Manual edit from terminal:"
echo '  cd automation && npm run edit -- "Make the hero text bigger on mobile"'
echo ""
echo "Manual edit from phone:"
echo "  GitHub app → $REPO → Actions → Site edit → Run workflow"
echo ""
