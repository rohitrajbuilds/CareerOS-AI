# Production Deployment

## Targets

- AWS Lightsail: FastAPI backend in `apps/backend`
- AWS S3: static trust center in `apps/legal-site`
- Chrome Web Store: packaged extension from `apps/extension/dist`

## Backend on AWS Lightsail

1. Create a Lightsail Linux instance.
2. Attach a static IP.
3. Point your API subdomain to that static IP.
4. Provision Docker with [infra/aws/lightsail/provision-ubuntu.sh](</e:/CareerOS AI/infra/aws/lightsail/provision-ubuntu.sh>).
5. Use [infra/aws/lightsail/.env.example](</e:/CareerOS AI/infra/aws/lightsail/.env.example>) as the base for `infra/aws/lightsail/.env`.
6. Deploy with [infra/aws/lightsail/deploy.sh](</e:/CareerOS AI/infra/aws/lightsail/deploy.sh>).
7. Verify `/` and `/api/v1/extension/health`.

## Legal site on AWS S3

1. Create a public S3 bucket for the legal site.
2. Enable static website hosting.
3. Upload the contents of `apps/legal-site`.
4. Use the public privacy URL in the Chrome Web Store listing.

## Extension release

1. Build the extension bundle.
2. Zip the contents of `apps/extension/dist`.
3. Upload the zip to the Chrome Web Store dashboard.
4. Reference the deployed privacy policy and permissions pages from the store listing.
