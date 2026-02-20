#!/bin/bash
set -e   # exit immediately on any error

APP_DIR="/var/www/studiomystri"
LOG_FILE="/var/log/studiomystri/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] ===== DEPLOYMENT STARTED =====" | tee -a $LOG_FILE

# Pull latest code
cd $APP_DIR
echo "[$(date)] Pulling latest code..." | tee -a $LOG_FILE
git pull origin main 2>&1 | tee -a $LOG_FILE

# Backend: install, generate, build
echo "[$(date)] Building backend..." | tee -a $LOG_FILE
cd $APP_DIR/backend
npm ci --omit=dev 2>&1 | tee -a $LOG_FILE
npx prisma generate 2>&1 | tee -a $LOG_FILE
npx prisma migrate deploy 2>&1 | tee -a $LOG_FILE
npm run build 2>&1 | tee -a $LOG_FILE

# Frontend: install, build
echo "[$(date)] Building frontend..." | tee -a $LOG_FILE
cd $APP_DIR/frontend
npm ci 2>&1 | tee -a $LOG_FILE
npm run build 2>&1 | tee -a $LOG_FILE

# Restart API with PM2 (zero-downtime cluster reload)
echo "[$(date)] Restarting PM2..." | tee -a $LOG_FILE
cd $APP_DIR
pm2 reload ecosystem.config.cjs --env production 2>&1 | tee -a $LOG_FILE

echo "[$(date)] ===== DEPLOYMENT COMPLETE =====" | tee -a $LOG_FILE
