# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-009 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD endpoints functioning, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure wired with worker boot and API client verified by test environments.

## Active Next Task
- **TASK-010: Workflow v1**
  - Implement `ghostHunterWorkflow` with durable timer loop, status transitions, activity invocations, and query handler.
  - Implement database/status activities and time-skipping workflow unit tests.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
