# Agent Rules — Ghost-Hunter

1. **Repo Memory is Ground Truth:**
   - Always read `.agent/` context files before starting work.
   - Update `.agent/` context files after every session.
   - Never rely on chat history across sessions.

2. **Sequential Task Execution:**
   - Follow `docs/ANTIGRAVITY_TASKS.md` sequentially.
   - Implement ONLY the current task and its strict dependencies.
   - Do not jump ahead to unrelated features.

3. **Temporal Determinism Rules:**
   - Workflow code (`apps/worker/src/workflows/`) must be purely deterministic.
   - Only import from `@temporalio/workflow` and `@ghost-hunter/shared`.
   - Never use `Date.now()`, `Math.random()`, `setTimeout`, or `fetch()` inside workflows.
   - All I/O, external network requests, database operations, and timers must be handled by Temporal workflow APIs or Activities.

4. **AI & Model Integrity:**
   - Local Gemma via Ollama only. No external cloud AI API calls in default MVP.
   - AI outputs must be validated by Zod schemas before being accepted.
   - Human in the loop: the agent drafts; the human approves, edits, or skips. Never auto-send follow-ups.

5. **Code & Validation Discipline:**
   - Monorepo packages must compile and typecheck cleanly (`pnpm -r typecheck`).
   - Every completed task must be verified with tests/typechecks before updating status to DONE.
   - Create clean, descriptive git commits for implemented tasks.
