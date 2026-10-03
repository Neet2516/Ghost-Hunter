# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-013 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, `ghostHunterWorkflow` running with deterministic stage loop and race guards, and Ollama client + draft generation activity implemented with prompt sanitization, Zod validation, retry policy, model health checks, and fallback template generation. Total 57 workspace tests passing.

## Active Next Task
- **TASK-014: Draft decision flow**
  - Implement `draftDecision` signal (`approve`, `skip`, `snooze`), review timeout (`DEFAULT_REVIEW_TIMEOUT_MS`), and multi-stage workflow integration.
  - Wire `generateFollowUpDraft` activity into `ghostHunterWorkflow`, handle draft review gate, status transitions (`AWAITING_REVIEW`), and user notifications.
  - Add workflow time-skipping tests for draft approval, skip, snooze, and review expiration.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm -r test` (57/57 tests passing) or `pnpm -r typecheck`.
