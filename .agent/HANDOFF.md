# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-019 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/decision`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with multi-stage cadence loop, draft generation via local Gemma (Ollama), human review gate in `AWAITING_REVIEW`, `draftDecision` signal handling (approve, skip, snooze), auto-skip review timeout, and race guards against mid-review replies. Draft review UI fully integrated with `StreamText` character typewriter, `DraftReviewPanel`, and inline editing. Notifications & SSE stream operational with EventBus, Fastify routes, `useEventStream` auto-invalidation, desktop browser alerts, and `/app/notifications` ledger page. Workflow UI fully operational with `TrailTimeline`, `CountdownMono` live cadence timer, `WorkflowPanel` Temporal telemetry & orbit controls, and `ModelStatus`. Chaos & disaster recovery test suite operational (`scripts/chaos.ts`, `scripts/chaos-worker-restart.sh`, `scripts/chaos-temporal-restart.sh`, `pnpm chaos`) covering Scenarios #5 and #6 with documented fault-tolerance in `docs/CHAOS_RECOVERY_RESULTS.md`. High-impact editorial Landing Page built (`/`) with Lenis smooth scroll, reduced-motion accessibility toggle, HeroSection, 5-step ScrollStory, ArchitectureSection comparison matrix, InteractiveDraftSimulator, and CtaBanner. Total 69 workspace tests passing.

## Active Next Task
- **TASK-020: Demo mode + seed**
  - Implement seconds delays toggle (`isDemoMode` parameter across creation stepper and workflow input).
  - Create database and workflow seed/reset script (`pnpm seed`, `scripts/seed.ts`).
  - Pre-populate rich realistic applications across all states: `HUNTING (WAITING)`, `HUNTING (AWAITING_REVIEW)`, `REPLIED`, `COMPLETED`, `CANCELLED`.
  - Validate: Seed runs cleanly, applications list displays sample data, fast seconds cadence enables rapid live demonstration.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (69/69 tests passing), `pnpm -r typecheck`, or `pnpm --filter @ghost-hunter/web build`.
- Run chaos recovery suite with `pnpm chaos`, `pnpm chaos:worker`, or `pnpm chaos:temporal`.
