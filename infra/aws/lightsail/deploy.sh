#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

cd "${SCRIPT_DIR}"

if [[ ! -f .env ]]; then
  echo "Missing infra/aws/lightsail/.env"
  exit 1
fi

docker compose pull
docker compose build backend
docker compose up -d

echo "Deployment complete."
echo "Health check: curl https://${APP_DOMAIN:-your-domain-here}/"
