#!/bin/bash
BACKUP_DIR="/var/backups/studiomystri"
DB_NAME="studiomystri"
DB_USER="studiomystri_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# Dump with compression
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME \
  | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Delete backups older than retention period
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
