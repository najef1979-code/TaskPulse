#!/bin/bash

# TaskPulse Database Backup Script
# Usage: ./backup-db.sh [days_to_keep]
# Default: keeps backups for 7 days

set -e

# Configuration
DB_PATH="./taskpulse.db"
BACKUP_DIR="./backups"
LOG_FILE="./backup-db.log"

# Get retention period from argument or use default
DAYS_TO_KEEP="${1:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/taskpulse_$TIMESTAMP.db"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting database backup..."

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    log "❌ ERROR: Database file not found at $DB_PATH"
    exit 1
fi

# Create backup
if cp "$DB_PATH" "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Remove old backups older than DAYS_TO_KEEP
    log "Cleaning up backups older than $DAYS_TO_KEEP days..."
    DELETED=$(find "$BACKUP_DIR" -name "taskpulse_*.db" -type f -mtime +"$DAYS_TO_KEEP" -delete -print 2>/dev/null | wc -l)
    
    if [ "$DELETED" -gt 0 ]; then
        log "🗑️  Deleted $DELETED old backup(s)"
    else
        log "✓ No old backups to delete"
    fi
    
    # List current backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/taskpulse_*.db 2>/dev/null | wc -l)
    log "📊 Current backup count: $BACKUP_COUNT"
    log "💾 Total disk usage: $(du -sh "$BACKUP_DIR" | cut -f1)"
    
    log "✅ Backup completed successfully"
else
    log "❌ ERROR: Failed to create backup"
    exit 1
fi