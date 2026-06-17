#!/usr/bin/env bash
set -euo pipefail

BOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.jandt.slack-bot"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
LOG_DIR="$HOME/Library/Logs/jandt-slack-bot"
NODE="$(command -v node)"

if [[ ! -f "$BOT_DIR/.env" ]]; then
  echo "Missing $BOT_DIR/.env"
  exit 1
fi

if [[ -z "$NODE" ]]; then
  echo "Node.js not found."
  exit 1
fi

cd "$BOT_DIR"
npm install --omit=dev 2>/dev/null || npm install
npm run build

mkdir -p "$LOG_DIR"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>WorkingDirectory</key>
  <string>${BOT_DIR}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE}</string>
    <string>${BOT_DIR}/dist/index.js</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>15</integer>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/out.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/err.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || launchctl unload "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || launchctl load "$PLIST"

echo "Installed background service: ${LABEL}"
echo "Logs: ${LOG_DIR}/out.log"
echo "Stop: launchctl bootout gui/$(id -u)/${LABEL}"
