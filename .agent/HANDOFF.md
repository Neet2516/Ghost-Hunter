# Handoff — Ghost-Hunter

## Current State
- **TASK-001 Complete:** Monorepo scaffolded, toolchain configured, builds verified.
- **TASK-002 Complete:** Shared schemas and validation in `@ghost-hunter/shared` verified with 14 passing unit tests and workspace typechecking.

## Next Task
- **TASK-003: DB + migrations**
  - Implement SQLite database schema using Drizzle ORM in `apps/api/src/db/schema.ts`.
  - Tables: `applications`, `followups`, `events`, `notifications`.
  - Add migration script and CRUD unit tests.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` or `pnpm -r typecheck`.
