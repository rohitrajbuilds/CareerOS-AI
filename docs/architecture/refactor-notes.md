# Enterprise Refactor Notes

This codebase has been refactored toward a more scalable shape with a few explicit rules:

- Shared status groups and AI enums live in `packages/shared-types`.
- Extension feature hooks should orchestrate actions, not own business rules.
- Application lifecycle rules are centralized in `apps/extension/src/features/applications/domain.ts`.
- Backend application analytics and mapping logic are centralized in `apps/backend/app/services/application_domain.py`.
- AI context trimming utilities are centralized in `apps/backend/app/services/ai/text_utils.py`.

These patterns make it easier to add new providers, new AI tools, and new API endpoints without introducing drift between features.
