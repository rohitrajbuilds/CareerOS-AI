# Production Deployment

## Targets

- Railway: FastAPI backend in `apps/backend`
- Vercel: static trust center in `apps/legal-site`
- Chrome Web Store: packaged extension from `apps/extension/dist`

## Backend on Railway

1. Create a Railway project with `production` and `staging` environments.
2. Add a PostgreSQL service and a Redis service.
3. Create a backend service linked to this repository.
4. Configure the service to use [apps/backend/railway.toml](</e:/CareerOS AI/apps/backend/railway.toml>) as the Railway config-as-code file.
5. Set the production variables from [apps/backend/.env.production.example](</e:/CareerOS AI/apps/backend/.env.production.example>).
6. Confirm the service listens on Railway's injected `PORT` through [apps/backend/docker/entrypoint.sh](</e:/CareerOS AI/apps/backend/docker/entrypoint.sh>).
7. Verify the health check path is `/`.

## Legal site on Vercel

1. Import the repository into Vercel.
2. Set the Vercel project root directory to `apps/legal-site`.
3. Use the included [apps/legal-site/vercel.json](</e:/CareerOS AI/apps/legal-site/vercel.json>).
4. Attach the production domain that will be used in the Chrome Web Store privacy policy field.

## Extension release

1. Build the extension bundle.
2. Zip the contents of `apps/extension/dist`.
3. Upload the zip to the Chrome Web Store dashboard.
4. Reference the deployed privacy policy and permissions pages from the store listing.
