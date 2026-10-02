# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Implemented full atomic UI primitive component suite in `apps/web/src/components/primitives` (TASK-006):
  - `Display`: Grotesque clamped display headings (`xl`, `h1`, `h2`, `h3`).
  - `Text`: Body, lead, caption, and muted text.
  - `MonoData`: Tabular JetBrains Mono data values with highlight variants.
  - `Button`: Primary, secondary, signal, destructive, and ghost buttons with loading spinners.
  - `LinkArrow`: Underlined link with animated arrow hover effect.
  - `Field`: Editorial bottom-border input, textarea, and select components with labels and validation error display.
  - `StatusChip`: Pill status badges mapping all application & sub-status states with animated pulsing dots.
  - `Hairline`: 1px ink rule divider.
  - `Grain`: SVG noise filter background.
  - `Section`: Editorial full-bleed color block container.
  - `Counter`: Giant display figures for countdowns and stats.
  - Showcased all primitives interactively on `/tokens` route with verified Next.js production build.
- Configured design system tokens, typography, and styles in `apps/web` (TASK-005).
- Implemented Fastify application CRUD endpoints and error handling in `apps/api` (TASK-004).
- Implemented SQLite database layer using Drizzle ORM and `better-sqlite3` in `apps/api/src/db` (TASK-003).
- Created complete shared schemas in `@ghost-hunter/shared` with 14 passing unit tests (TASK-002).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
