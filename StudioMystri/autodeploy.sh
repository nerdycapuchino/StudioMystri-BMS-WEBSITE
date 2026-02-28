#!/bin/bash
set -e
LOG_FILE="/var/log/studiomystri_deploy.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

log "Starting auto-deployment..."

cd /var/www/studiomystri/StudioMystri
CURRENT_COMMIT=$(git rev-parse HEAD)

git fetch origin main
git config pull.rebase false
git pull origin main || { log "Git pull failed"; exit 1; }

NEW_COMMIT=$(git rev-parse HEAD)
if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
    log "Already up-to-date. Exiting."
    exit 0
fi

log "Changes detected from $CURRENT_COMMIT to $NEW_COMMIT. Building..."

# Backend
cd /var/www/studiomystri/StudioMystri/bms/backend
npm install >> $LOG_FILE 2>&1 || { log "Backend npm install failed"; git reset --hard $CURRENT_COMMIT; exit 1; }
npx prisma generate >> $LOG_FILE 2>&1
npx prisma migrate deploy >> $LOG_FILE 2>&1 || { log "Database migration failed"; git reset --hard $CURRENT_COMMIT; exit 1; }

# BMS Frontend
cd /var/www/studiomystri/StudioMystri/bms/frontend
npm install >> $LOG_FILE 2>&1 || { log "BMS Frontend npm install failed"; git reset --hard $CURRENT_COMMIT; exit 1; }
export NODE_OPTIONS="--max-old-space-size=1024"
npm run build >> $LOG_FILE 2>&1 || { log "BMS Frontend build failed"; git reset --hard $CURRENT_COMMIT; exit 1; }

# eCommerce Frontend
cd /var/www/studiomystri/StudioMystri/ecommerce
npm install >> $LOG_FILE 2>&1 || { log "eCommerce Frontend npm install failed"; git reset --hard $CURRENT_COMMIT; exit 1; }
export NODE_OPTIONS="--max-old-space-size=1024"
npm run build >> $LOG_FILE 2>&1 || { log "eCommerce Frontend build failed"; git reset --hard $CURRENT_COMMIT; exit 1; }

# Restart PM2
pm2 restart mystri-backend >> $LOG_FILE 2>&1 || { log "PM2 restart failed"; git reset --hard $CURRENT_COMMIT; exit 1; }

log "Auto-deployment successfully completed."
