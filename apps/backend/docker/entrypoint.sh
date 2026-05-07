#!/bin/sh
set -eu

PORT_VALUE="${PORT:-${BACKEND_PORT:-8000}}"
WORKERS_VALUE="${UVICORN_WORKERS:-2}"

exec uvicorn app.main:app \
  --host "${BACKEND_HOST:-0.0.0.0}" \
  --port "${PORT_VALUE}" \
  --workers "${WORKERS_VALUE}" \
  --proxy-headers \
  --forwarded-allow-ips="*"
