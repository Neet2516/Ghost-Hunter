# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-018 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/decision`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with multi-stage cadence loop, draft generation via local Gemma (Ollama), human review gate in `AWAITING_REVIEW`, `draftDecision` signal handling (approve, skip, snooze), auto-skip review timeout, and race guards against mid-review replies. Draft review UI fully integrated with `StreamText` character typewriter, `DraftReviewPanel`, and inline editing. Notifications & SSE stream operational with EventBus, Fastify routes, `useEventStream` auto-invalidation, desktop browser alerts, and `/app/notifications` ledger page. Workflow UI fully operational with `TrailTimeline`, `CountdownMono` live cadence timer, `WorkflowPanel` Temporal telemetry & orbit controls, and `ModelStatus`. Chaos & disaster recovery test suite operational (`scripts/chaos.ts`, `scripts/chaos-worker-restart.sh`, `scripts/chaos-temporal-restart.sh`, `pnpm chaos`) covering Scenarios #5 and #6 with documented fault-tolerance in `docs/CHAOS_RECOVERY_RESULTS.md`. Total 69 workspace tests passing.

## Active Next Task
- **TASK-019: Landing + motion**
  - Implement editorial landing page (`/`) with GSAP / CSS scroll story, waveform animations, reveals, and reduced-motion toggle.
  - Areas: `apps/web/src/app/page.tsx`, `apps/web/src/components/marketing/`.
  - Validate: Landing page renders with rich aesthetics, responsive layout, motion accessibility, and passes `next build`.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (69/69 tests passing), `pnpm -r typecheck`, or `pnpm --filter @ghost-hunter/web build`.
- Run chaos recovery suite with `pnpm chaos`, `pnpm chaos:worker`, or `pnpm chaos:temporal`.
