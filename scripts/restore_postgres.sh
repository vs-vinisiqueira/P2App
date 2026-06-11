#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Uso: scripts/restore_postgres.sh ./backups/p2app-YYYYMMDD-HHMMSS.dump" >&2
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Arquivo de backup nao encontrado: ${BACKUP_FILE}" >&2
  exit 1
fi

docker compose -f docker-compose.prod.yml exec -T db pg_restore \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --clean \
  --if-exists \
  < "${BACKUP_FILE}"

echo "Restore concluido a partir de ${BACKUP_FILE}"
