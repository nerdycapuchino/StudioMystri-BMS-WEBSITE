#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/studiomystri"
LOG_FILE="/var/log/studiomystri/deploy.log"
FAILED_MARKER="/var/log/studiomystri/last-deploy-failed"
SUCCESS_SHA_FILE="/var/log/studiomystri/last-successful-deploy.sha"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p /var/log/studiomystri
touch "$LOG_FILE"

on_error() {
    echo "[$(date)] ===== DEPLOYMENT FAILED =====" | tee -a "$LOG_FILE"
    touch "$FAILED_MARKER"
}
trap on_error ERR

echo "[$TIMESTAMP] ===== DEPLOYMENT STARTED =====" | tee -a $LOG_FILE

# Pull latest code
cd "$APP_DIR"
echo "[$(date)] Pulling latest code..." | tee -a $LOG_FILE
git pull origin main 2>&1 | tee -a $LOG_FILE

# Backend: install, generate, build
echo "[$(date)] Building backend..." | tee -a $LOG_FILE
cd "$APP_DIR/backend"
npm ci 2>&1 | tee -a $LOG_FILE
npx prisma generate 2>&1 | tee -a $LOG_FILE
npx prisma migrate deploy 2>&1 | tee -a $LOG_FILE

# Keep default access users synchronized (upsert + activate + password reset)
echo "[$(date)] Syncing default auth users..." | tee -a $LOG_FILE
node force_passwords.js 2>&1 | tee -a $LOG_FILE

npm run build 2>&1 | tee -a $LOG_FILE
npm prune --omit=dev 2>&1 | tee -a $LOG_FILE

# Frontend: install, build
echo "[$(date)] Building frontend..." | tee -a $LOG_FILE
cd "$APP_DIR/frontend"
npm ci 2>&1 | tee -a $LOG_FILE
npm run build 2>&1 | tee -a $LOG_FILE

# Restart API with PM2 (zero-downtime cluster reload)
echo "[$(date)] Restarting PM2..." | tee -a $LOG_FILE
cd "$APP_DIR"
pm2 reload ecosystem.config.cjs --env production 2>&1 | tee -a $LOG_FILE

git rev-parse HEAD > "$SUCCESS_SHA_FILE"
rm -f "$FAILED_MARKER"
echo "[$(date)] ===== DEPLOYMENT COMPLETE =====" | tee -a $LOG_FILE
