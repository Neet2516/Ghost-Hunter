# Handoff — Ghost-Hunter

## Current State
- **TASK-001 Complete:** Monorepo initialized and builds verified.
- **TASK-002 Complete:** Shared domain schemas, enums, API contracts, and unit tests passing.
- **TASK-003 Complete:** SQLite schema, Drizzle migration generation, connection management, repository CRUD, and integration tests passing.
- **TASK-004 Complete:** Fastify application CRUD endpoints, Zod validation, error envelope, and integration tests passing.
- **TASK-005 Complete:** Design system tokens, typography with `next/font/google`, tactile noise grain, and `/tokens` validation page verified.

## Next Task
- **TASK-006: Primitives**
  - Implement atomic primitives in `apps/web/src/components/primitives/`:
    - `Display`, `Text`, `MonoData`, `Button`, `LinkArrow`, `Field`, `StatusChip`, `Hairline`, `Grain`, `Section`, `Counter`.
  - Validate with component rendering / snapshot / unit tests.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
