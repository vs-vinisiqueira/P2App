#!/bin/sh
# Cron de backup diário do P2App.
# Instalar: crontab -e
#   0 2 * * * /opt/p2app/scripts/cron-backup.sh >> /var/log/p2app-backup.log 2>&1

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

set -a
. ./.env.production
set +a

sh scripts/backup_postgres.sh

# Apagar backups com mais de 30 dias
find ./backups -name "p2app-*.dump" -mtime +30 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup concluido."
