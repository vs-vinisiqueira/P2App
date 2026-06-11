#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILE="${BACKUP_DIR}/p2app-${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"
docker compose -f docker-compose.prod.yml exec -T db pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  -F c \
  > "${FILE}"

echo "Backup criado em ${FILE}"
