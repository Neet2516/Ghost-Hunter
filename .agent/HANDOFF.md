# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-008 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD endpoints functioning, design tokens established, primitives built, app shell running, and full Applications UI (List, 3-step wizard, detail view with timeline) integrated.

## Active Next Task
- **TASK-009: Temporal Infra**
  - Configure local Temporal server setup (`docker-compose.yml` or script with persistent SQLite `--db-filename ./temporal.db`).
  - Wire worker bootstrap in `apps/worker/src/worker.ts` and API Temporal client in `apps/api/src/temporal/`.
  - Validate worker connection and queue readiness.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
