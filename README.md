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
