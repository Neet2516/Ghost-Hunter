# Handoff — Ghost-Hunter

## Current State
- **TASK-001 through TASK-010 Complete:** Monorepo initialized, shared schemas created, SQLite migrations configured, Fastify CRUD endpoints functioning, design tokens established, primitives built, app shell & Applications UI integrated, Temporal infrastructure operational, and `ghostHunterWorkflow` v1 running with deterministic stage loop, durable wait, activity persistence, and time-skipping test verification.

## Active Next Task
- **TASK-011: Signals + race guard**
  - Implement `recruiterReplied` and `cancelHunt` signals in `ghostHunterWorkflow`.
  - Implement deterministic race guard using `condition()` to interrupt wait loop and safely discard drafts if race occurs during generation.

## Notes & Environment
- Node and pnpm are in `~/.local/bin`. Keep PATH exported (`export PATH="/home/kailler/.local/bin:$PATH"`).
- Test with `pnpm test` (31/31 tests passing) or `pnpm -r typecheck`.
