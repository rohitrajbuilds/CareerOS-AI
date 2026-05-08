# CareerOS AI

Production-grade monorepo scaffold for the CareerOS AI Chrome extension and FastAPI backend.

## Apps

- `apps/extension`: Chrome Extension built with React, TypeScript, Tailwind, Vite, Zustand, and Manifest V3.
- `apps/backend`: FastAPI backend with modular service layout and Docker support.

## Packages

- `packages/shared-types`: shared TypeScript contracts for extension messaging and API shapes.
- `packages/shared-prompts`: prompt metadata and starter registries.
- `packages/shared-ui`: shared React UI primitives.
- `packages/shared-config`: shared frontend runtime configuration helpers.

## Quick start

```bash
pnpm install
pnpm dev:extension
```

```bash
cd apps/backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

## Production

- Backend API: deploy `apps/backend` to AWS Lightsail using the files in [infra/aws/lightsail](</e:/CareerOS AI/infra/aws/lightsail>).
- Legal and privacy site: deploy `apps/legal-site` to S3 using the provided GitHub Actions workflow.
- Chrome extension: build `apps/extension/dist`, package it as a zip, and submit it through the Chrome Web Store dashboard with the documents in `docs/deployment`.

## Developer experience

- Run `pnpm verify` for the main repo quality gate.
- Review [CONTRIBUTING.md](</e:/CareerOS AI/CONTRIBUTING.md>) before large feature work.
- See [docs/architecture/refactor-notes.md](</e:/CareerOS AI/docs/architecture/refactor-notes.md>) for the current organization rules.
