# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Implemented App Shell and Layout system in `apps/web` (TASK-007):
  - `AppLayout` and `AppNavbar` with active navigation tabs, model health indicator dot, notification bell with unread badge, and quick action "+ New Hunt".
  - `MarketingLayout` and `MarketingNavbar` with brand messaging and CTA.
  - Domain components: `EmptyState` with customized action triggers, `ErrorState` with retry support, and `DegradedBanner` for degraded Ollama alerting.
  - Scaffolded `/app` dashboard screen featuring metrics counters, Temporal sentinel status panel, and active hunt stream.
- Implemented full atomic UI primitive component suite in `apps/web/src/components/primitives` (TASK-006).
- Configured design system tokens, typography, and styles in `apps/web` (TASK-005).
- Implemented Fastify application CRUD endpoints and error handling in `apps/api` (TASK-004).
- Implemented SQLite database layer using Drizzle ORM and `better-sqlite3` in `apps/api/src/db` (TASK-003).
- Created complete shared schemas in `@ghost-hunter/shared` with 14 passing unit tests (TASK-002).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
