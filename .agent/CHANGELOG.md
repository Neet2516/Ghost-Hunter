# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Implemented Fastify application CRUD endpoints and error handling in `apps/api` (TASK-004):
  - `POST /api/applications`: Zod-validated creation with automatic `CREATED` event recording.
  - `GET /api/applications`: Listing with optional `?status=` filtering.
  - `GET /api/applications/:id`: UUID validation with 404 for missing and 400 for malformed IDs.
  - `PATCH /api/applications/:id`: Partial update with field-level validation.
  - `DELETE /api/applications/:id`: Cascading deletion.
  - `GET /api/applications/:id/events`: Chronological event trail.
  - `GET /api/applications/:id/followups`: Follow-up history.
  - Standard error envelope: `{ error: { code, message, fields? } }`.
  - Added 11 API integration tests in `apps/api/src/routes/__tests__/applications.test.ts`. Total tests: 31/31 passing across workspace.
- Implemented SQLite database layer using Drizzle ORM and `better-sqlite3` in `apps/api/src/db` (TASK-003).
- Created complete shared schemas in `@ghost-hunter/shared` with 14 passing unit tests (TASK-002).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
