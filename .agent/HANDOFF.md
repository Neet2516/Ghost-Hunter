# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-012 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD and workflow control endpoints (`/start`, `/reply`, `/cancel`, `/state`) functioning with 409 duplicate protection, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, and `ghostHunterWorkflow` running with deterministic stage loop and race guards.

## Active Next Task
- **TASK-013: Ollama client + draft activity**
  - Implement Ollama client in `apps/worker/src/ollama/client.ts` with structured JSON output, prompt construction, Zod validation, retry policy, and fallback template.
  - Create `generateFollowUpDraft` activity in `apps/worker/src/activities/ollama.ts`.
  - Validate with prompt builder tests and mock Ollama stub (Scenarios #7, #8, #9, #10).

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (44/44 tests passing) or `pnpm -r typecheck`.
