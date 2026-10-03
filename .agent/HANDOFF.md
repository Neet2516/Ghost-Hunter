# Handoff — Ghost-Hunter

# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-017 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/decision`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with multi-stage cadence loop, draft generation via local Gemma (Ollama), human review gate in `AWAITING_REVIEW`, `draftDecision` signal handling (approve, skip, snooze), auto-skip review timeout, and race guards against mid-review replies. Draft review UI fully integrated with `StreamText` character typewriter, `DraftReviewPanel`, and inline editing. Notifications & SSE stream operational with EventBus, Fastify routes, `useEventStream` auto-invalidation, desktop browser alerts, and `/app/notifications` ledger page. Workflow UI fully operational with `TrailTimeline`, `CountdownMono` live cadence timer, `WorkflowPanel` Temporal telemetry & orbit controls, and `ModelStatus`. Total 69 workspace tests passing.

## Active Next Task
- **TASK-018: Chaos/recovery tests**
  - Implement test scripts for Scenarios #5 & #6:
    - Scenario 5: Worker killed during wait loop -> restarted -> workflow resumes timer without losing state.
    - Scenario 6: Temporal server restart / network blip -> worker reconnects -> pending tasks drain.
  - Document recovery behavior, zero-loss guarantees, and reproducible verification steps.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (69/69 tests passing), `pnpm -r typecheck`, or `pnpm --filter @ghost-hunter/web build`.
