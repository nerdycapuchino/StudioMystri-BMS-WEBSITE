#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/studiomystri"
LOCK_FILE="/tmp/studiomystri-auto-deploy.lock"
LOG_FILE="/var/log/studiomystri/auto-deploy.log"

mkdir -p /var/log/studiomystri

{
    flock -n 9 || {
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Another auto-deploy is already running. Skipping."
        exit 0
    }

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== AUTO-DEPLOY CHECK START ====="
    cd "$APP_DIR"
    git fetch origin main --quiet

    LOCAL_REV="$(git rev-parse HEAD)"
    REMOTE_REV="$(git rev-parse origin/main)"

    if [ "$LOCAL_REV" = "$REMOTE_REV" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] No changes detected. Skipping deploy."
        exit 0
    fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Change detected: $LOCAL_REV -> $REMOTE_REV"
    bash "$APP_DIR/scripts/deploy.sh"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== AUTO-DEPLOY SUCCESS ====="
} 9>"$LOCK_FILE" >>"$LOG_FILE" 2>&1
