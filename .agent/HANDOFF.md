# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-011 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD endpoints functioning, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, and `ghostHunterWorkflow` running with deterministic stage loop, signals (`recruiterReplied`, `cancelHunt`), and race guard verified by time-skipping tests #3, #4, #14.

## Active Next Task
- **TASK-012: Start/reply/cancel endpoints + duplicate protection**
  - Implement Fastify REST endpoints for workflow operations:
    - `POST /api/applications/:id/start`: starts workflow, returns 409 if already started, updates status to `HUNTING`.
    - `POST /api/applications/:id/reply`: sends `recruiterReplied` signal.
    - `POST /api/applications/:id/cancel`: sends `cancelHunt` signal.
    - `GET /api/applications/:id/state`: queries Temporal state and database.
  - Verify with route tests (Scenarios #1 and #12).

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (39/39 tests passing) or `pnpm -r typecheck`.
