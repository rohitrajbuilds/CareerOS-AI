# Contributing

## Principles

- Keep domain logic out of route handlers and view components when possible.
- Prefer feature services and shared domain utilities over copy-paste.
- Keep backend modules asynchronous, typed, and dependency-injected.
- Treat Chrome pages and job-site DOM content as untrusted input.

## Frontend structure

- `features/*`: domain logic and feature UI
- `lib/*`: cross-feature runtime helpers
- `sidepanel/store/*`: lightweight UI state cache and selectors

## Backend structure

- `api/*`: transport layer only
- `services/*`: business logic
- `schemas/*`: request and response contracts

## Refactor guardrails

- Add tests when moving logic that affects persistence or API behavior.
- Export shared constants for repeated enums and status groupings.
- Add short comments only where intent is not obvious from the code.
