# Release Pipeline

## Branching

- `main`: production-ready branch
- `staging`: optional pre-production branch for release candidates

## Automated flow

1. CI runs lint, typecheck, unit tests, backend tests, E2E, and extension build.
2. Railway deploy workflow can publish the backend from `main`.
3. Vercel deploy workflow can publish the legal site from `main`.
4. Release artifact workflow packages the extension zip and backend image tarball on tags.

## Manual production cut

1. Tag a release commit like `v0.1.0`.
2. Let `release-artifacts.yml` generate the extension artifact.
3. Upload the extension zip in the Chrome Web Store dashboard.
4. Roll out backend changes on Railway.
5. Confirm the privacy policy and permissions pages are live on Vercel.
6. Monitor logs, health checks, and user-install telemetry.
