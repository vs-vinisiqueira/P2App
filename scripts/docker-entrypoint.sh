#!/bin/sh
set -e

python - <<'PY'
import os
import socket
import time

host = os.getenv("DB_HOST", "db")
port = int(os.getenv("DB_PORT", "5432"))
timeout_seconds = int(os.getenv("DB_WAIT_TIMEOUT", "30"))
deadline = time.time() + timeout_seconds

while True:
    try:
        with socket.create_connection((host, port), timeout=2):
            break
    except OSError:
        if time.time() >= deadline:
            raise TimeoutError(f"Database {host}:{port} was not available in time")
        time.sleep(1)
PY

exec "$@"
