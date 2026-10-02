# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Configured design system tokens, typography, and styles in `apps/web` (TASK-005):
  - Loaded Google Fonts (`Bricolage Grotesque`, `Inter`, `JetBrains Mono`) with font variables via `next/font/google`.
  - Configured core palette CSS variables (`--ink`, `--paper`, `--signal`, `--phantom`, `--moss`, `--bone`, `--ash`) and workflow status colors.
  - Implemented tactile noise grain SVG overlay, hard offset box-shadows, and hairlines.
  - Configured clamped display typography utilities and button/input interactive styles.
  - Added `/tokens` validation route showcasing palette tokens, status badges, typography scale, buttons, and inputs.
- Implemented Fastify application CRUD endpoints and error handling in `apps/api` (TASK-004).
- Implemented SQLite database layer using Drizzle ORM and `better-sqlite3` in `apps/api/src/db` (TASK-003).
- Created complete shared schemas in `@ghost-hunter/shared` with 14 passing unit tests (TASK-002).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
