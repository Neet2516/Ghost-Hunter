# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Implemented SQLite database layer using Drizzle ORM and `better-sqlite3` in `apps/api/src/db` (TASK-003):
  - Defined schema for `applications`, `followups`, `events`, and `notifications` with foreign keys and status indexes.
  - Generated initial SQL migration (`drizzle/0000_faulty_richard_fisk.sql`) using `drizzle-kit`.
  - Added programmatic database connection with WAL mode and foreign keys enabled.
  - Implemented typed `DatabaseRepository` CRUD operations and automatic event logging.
  - Added integration tests covering migrations, CRUD lifecycle, cascade deletion, and notification queries (6/6 passing).
- Created complete shared schemas in `@ghost-hunter/shared` with 14 passing unit tests (TASK-002).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
