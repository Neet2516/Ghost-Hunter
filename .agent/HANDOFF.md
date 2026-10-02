# Handoff — Ghost-Hunter

## Current State
- **TASK-001 Complete:** Monorepo initialized and builds verified.
- **TASK-002 Complete:** Shared domain schemas, enums, API contracts, and unit tests passing.
- **TASK-003 Complete:** SQLite schema, Drizzle migration generation, connection management, repository CRUD, and integration tests passing.
- **TASK-004 Complete:** Fastify application CRUD endpoints, Zod validation, error envelope, and integration tests passing. Total 31 tests passing across workspace.

## Next Task
- **TASK-005: Design tokens & fonts**
  - Implement full design system tokens in `apps/web`:
    - Palette: `--ink`, `--paper`, `--signal`, `--phantom`, `--moss`, `--bone`, `--ash`, review amber, failure red.
    - Typography: Display (Anton / Bricolage Grotesque), Body (Inter), Mono (JetBrains Mono).
    - Grid & spacing: 8px base scale, hard offset shadow (`4px 4px 0 ink`), hairline borders, noise grain overlay.
    - Token preview component / test.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
