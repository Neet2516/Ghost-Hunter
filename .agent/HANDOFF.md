# Handoff — Ghost-Hunter

## Current State
- **TASK-001 Complete:** Monorepo initialized and builds verified.
- **TASK-002 Complete:** Shared domain schemas, enums, API contracts, and unit tests passing.
- **TASK-003 Complete:** SQLite schema, Drizzle migration generation, connection management, repository CRUD, and integration tests passing.
- **TASK-004 Complete:** Fastify application CRUD endpoints, Zod validation, error envelope, and integration tests passing.
- **TASK-005 Complete:** Design system tokens, typography, tactile noise grain, and `/tokens` validation page verified.
- **TASK-006 Complete:** Reusable design primitives (`Display`, `Text`, `MonoData`, `Button`, `LinkArrow`, `Field`, `StatusChip`, `Hairline`, `Grain`, `Section`, `Counter`) verified in `/tokens` build.

## Next Task
- **TASK-007: App shell**
  - Implement layout architecture in `apps/web/src/components/layout/`:
    - `MarketingLayout`: Full-screen overlay menu, tactile grain, pinned story container.
    - `AppLayout`: Slim top header, model health indicator dot, notification bell with unread count, navigation bar (`/app`, `/app/applications`, `/app/notifications`, `/app/settings`).
    - Domain placeholders: `EmptyState`, `ErrorState`, `DegradedBanner`.
  - Validate with a mocked `/app` dashboard screen.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
