# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-011: Signals + race guard**
  - Implement `recruiterReplied` and `cancelHunt` signals in `ghostHunterWorkflow`.
  - Implement deterministic race guard: condition wait `await condition(() => replied || cancelled, delayMs)`.
  - Handle race condition if reply/cancel arrives during activity execution (discard draft, finalize status).
  - Add test scenarios for reply signal, cancellation signal, and race condition with `@temporalio/testing`.

## Immediately Following Tasks:
1. **TASK-012: Start/reply/cancel endpoints + duplicate protection**
   - Wire workflow start, signal recruiter replied, and cancel endpoints to Fastify API with 409 duplicate check.
