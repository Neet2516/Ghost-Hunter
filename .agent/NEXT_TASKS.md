# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-003: DB + migrations**
  - Setup Drizzle SQLite schema for `applications`, `followups`, `events`, and `notifications` in `apps/api/src/db`.
  - Configure migration tooling and database client.
  - Implement CRUD helpers and integration test.

## Immediately Following Tasks:
1. **TASK-004: API CRUD**
   - Implement Fastify REST routes for applications, start/reply/cancel, followups decision, events, and health.
   - Wire Zod validation from `@ghost-hunter/shared`.
2. **TASK-005: Design tokens & fonts**
   - Configure typography, design tokens, and CSS variables in `apps/web/styles`.
3. **TASK-006: Primitives**
   - Implement Display, Text, Button, Field, StatusChip, and Section components.
