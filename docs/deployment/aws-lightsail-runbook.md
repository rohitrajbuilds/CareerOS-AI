# AWS Lightsail Runbook

## Architecture

- `1 x Lightsail Linux instance`
- `Caddy` for HTTPS and reverse proxy
- `FastAPI backend` in Docker
- `PostgreSQL` in Docker on the same box
- `Redis` in Docker on the same box
- `S3` bucket for privacy and permissions pages

This is the recommended low-cost launch path for CareerOS AI.

## Recommended instance

- Start with a small Linux/Unix Lightsail instance
- Use Ubuntu LTS
- Attach a static IP

## Instance bootstrap

1. SSH into the box.
2. Clone the repo.
3. Run [infra/aws/lightsail/provision-ubuntu.sh](</e:/CareerOS AI/infra/aws/lightsail/provision-ubuntu.sh>).
4. Copy [infra/aws/lightsail/.env.example](</e:/CareerOS AI/infra/aws/lightsail/.env.example>) to `.env` and fill real values.
5. Set `APP_DOMAIN` to your API domain.
6. Run [infra/aws/lightsail/deploy.sh](</e:/CareerOS AI/infra/aws/lightsail/deploy.sh>).

## DNS

- Point `api.yourdomain.com` to the Lightsail static IP
- Wait for DNS propagation
- Caddy will provision TLS automatically after DNS resolves

## Health checks

- `curl https://api.yourdomain.com/`
- `curl https://api.yourdomain.com/api/v1/extension/health`

## Cost controls

- Keep one instance only
- Keep one Postgres container only
- Avoid RDS and ElastiCache until usage justifies them
- Keep backups simple and scheduled
