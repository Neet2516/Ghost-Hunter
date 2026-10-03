# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-014 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/decision`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with multi-stage cadence loop, draft generation via local Gemma (Ollama), human review gate in `AWAITING_REVIEW`, `draftDecision` signal handling (approve, skip, snooze), auto-skip review timeout, and race guards against mid-review replies. Total 62 workspace tests passing.

## Active Next Task
- **TASK-015: Draft review UI**
  - Create `DraftReviewPanel`, `StreamText`, and review action buttons (Approve, Skip, Snooze) wired to API `POST /api/applications/:id/decision`.
  - Provide inline editing for draft body before approval.
  - Integrate into Application detail view (`/app/applications/[id]`).

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (62/62 tests passing) or `pnpm -r typecheck`.
