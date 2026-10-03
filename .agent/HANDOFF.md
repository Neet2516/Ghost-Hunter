# Handoff — Ghost-Hunter

# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-015 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/decision`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with multi-stage cadence loop, draft generation via local Gemma (Ollama), human review gate in `AWAITING_REVIEW`, `draftDecision` signal handling (approve, skip, snooze), auto-skip review timeout, and race guards against mid-review replies. Draft review UI fully integrated with `StreamText` character typewriter, `DraftReviewPanel`, and inline editing wired to API. Total 62 workspace tests passing.

## Active Next Task
- **TASK-016: Notifications + SSE**
  - Implement Fastify notification endpoints (`GET /api/notifications`, `PATCH /api/notifications/read`).
  - Implement SSE endpoint `GET /api/events/stream` with heartbeat and event bus.
  - Implement `notifyUser` activity proxy and DB event emission.
  - Implement `useEventStream` hook in `apps/web` with automatic TanStack Query invalidation.
  - Implement `/app/notifications` page and `AppNavbar` unread notification counter & desktop notification prompt.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (62/62 tests passing), `pnpm -r typecheck`, or `pnpm --filter @ghost-hunter/web build`.
