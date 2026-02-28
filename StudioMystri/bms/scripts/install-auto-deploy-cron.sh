#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/studiomystri"
AUTO_DEPLOY_SCRIPT="$APP_DIR/scripts/auto-deploy.sh"
CRON_EXPR="${1:-*/5 * * * *}"
CRON_CMD="bash $AUTO_DEPLOY_SCRIPT"
CRON_LINE="$CRON_EXPR $CRON_CMD"

if [ ! -f "$AUTO_DEPLOY_SCRIPT" ]; then
    echo "Auto deploy script not found at: $AUTO_DEPLOY_SCRIPT"
    exit 1
fi

chmod +x "$APP_DIR/scripts/deploy.sh"
chmod +x "$AUTO_DEPLOY_SCRIPT"

TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -vF "$CRON_CMD" > "$TMP_CRON" || true
echo "$CRON_LINE" >> "$TMP_CRON"
crontab "$TMP_CRON"
rm -f "$TMP_CRON"

echo "Installed auto-deploy cron:"
echo "  $CRON_LINE"
echo "Logs:"
echo "  /var/log/studiomystri/auto-deploy.log"
echo "  /var/log/studiomystri/deploy.log"

