# Environment Management

## Recommended environments

- `local`: developer workstation with `.env.example`
- `staging`: internal QA and store-prep validation
- `production`: public backend and legal site

## Source of truth

- Root examples: [`.env.example`](</e:/CareerOS AI/.env.example>) and [`.env.production.example`](</e:/CareerOS AI/.env.production.example>)
- Backend examples: [apps/backend/.env.example](</e:/CareerOS AI/apps/backend/.env.example>) and [apps/backend/.env.production.example](</e:/CareerOS AI/apps/backend/.env.production.example>)
- Extension examples: [apps/extension/.env.production.example](</e:/CareerOS AI/apps/extension/.env.production.example>)
- Lightsail host example: [infra/aws/lightsail/.env.example](</e:/CareerOS AI/infra/aws/lightsail/.env.example>)

## Rules

- Never commit real secrets.
- Keep production secrets in the Lightsail host `.env` file and GitHub Actions secrets for S3 deploys.
- Rotate `SECRET_KEY`, database credentials, and API tokens on schedule.
- Keep `ENABLE_DB_AUTO_CREATE=false` in production.
- Use separate OpenAI API keys for staging and production.
- Keep Chrome Web Store listing URLs aligned with the deployed legal site.

## Minimum production secrets

- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `SECRET_KEY`
- `BACKEND_CORS_ORIGINS`
- `BACKEND_CORS_ORIGIN_REGEX`
- `VITE_API_BASE_URL`
- `VITE_PRIVACY_POLICY_URL`
- `APP_DOMAIN`
