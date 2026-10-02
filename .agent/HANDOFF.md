# Handoff — Ghost-Hunter

## Current State
- **TASK-001 Complete:** Monorepo initialized and builds verified.
- **TASK-002 Complete:** Shared domain schemas, enums, API contracts, and unit tests passing.
- **TASK-003 Complete:** SQLite schema, Drizzle migration generation, connection management, repository CRUD, and integration tests passing.

## Next Task
- **TASK-004: API CRUD**
  - Implement Fastify REST routes for application CRUD:
    - `POST /api/applications`
    - `GET /api/applications`
    - `GET /api/applications/:id`
    - `PATCH /api/applications/:id`
    - `DELETE /api/applications/:id`
  - Wire Fastify Zod schema validation using `@ghost-hunter/shared` contracts.
  - Return standardized error envelope `{ error: { code, message, fields? } }`.
  - Validate with API route integration tests.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (20/20 tests currently passing) or `pnpm -r typecheck`.
