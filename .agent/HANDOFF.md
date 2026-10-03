# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-016 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/decision`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with multi-stage cadence loop, draft generation via local Gemma (Ollama), human review gate in `AWAITING_REVIEW`, `draftDecision` signal handling (approve, skip, snooze), auto-skip review timeout, and race guards against mid-review replies. Draft review UI fully integrated with `StreamText` character typewriter, `DraftReviewPanel`, and inline editing. Notifications & SSE stream operational with EventBus, Fastify routes, `useEventStream` auto-invalidation, desktop browser alerts, and `/app/notifications` ledger page. Total 69 workspace tests passing (14 shared + 33 API + 22 worker).

## Active Next Task
- **TASK-017: Workflow UI**
  - Implement `TrailTimeline` multi-stage timeline nodes (`DONE`, `ACTIVE`, `WAITING`, `SKIPPED`).
  - Implement `CountdownMono` high-precision cadence monospace countdown timer.
  - Implement `WorkflowPanel` temporal sentinel telemetry display (Workflow ID, Task Queue, run status, next timer).
  - Implement `ModelStatus` component displaying real-time local Gemma/Ollama status.
  - Implement `DegradedBanner` displaying graceful offline/template state warnings.
  - Integrate into Application detail view (`/app/applications/[id]`) and Dashboard.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (69/69 tests passing), `pnpm -r typecheck`, or `pnpm --filter @ghost-hunter/web build`.
