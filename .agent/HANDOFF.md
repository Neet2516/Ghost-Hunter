# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-007 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD endpoints functioning, design tokens established, primitives built, app shell & `/app` dashboard screen running.

## Active Next Task
- **TASK-008: Applications UI**
  - Implement typed API client in `apps/web/src/lib/api.ts` connecting to `http://localhost:3001`.
  - Build Applications list page (`/app/applications`) with search, status filters, and `EmptyState`.
  - Build stepped creation form (`/app/applications/new`).
  - Build application detail page (`/app/applications/[id]`).

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
