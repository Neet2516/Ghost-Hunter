# Constraints — Ghost-Hunter

## Hard Constraints (Must NEVER be violated)
1. **Workflow Determinism:**
   - Workflows in `apps/worker/src/workflows/` must NEVER invoke asynchronous I/O, file systems, network requests, random numbers, or non-deterministic time functions.
   - Only import from `@temporalio/workflow` and `@ghost-hunter/shared`.
   - All external actions must be dispatched through Activities.

2. **Data Privacy (Zero-Cloud by Default):**
   - No user contact information, recruiter names, or outreach messages may be sent to third-party cloud APIs.
   - All AI generation must query the local Ollama instance (`localhost:11434`).
   - SQLite database must remain local.

3. **No Automatic Sending:**
   - The application does not send emails or messages automatically.
   - Drafts are proposed to the user for copy/paste approval.

4. **Sequential Execution:**
   - Follow `docs/ANTIGRAVITY_TASKS.md` sequentially.
   - Validate each task before moving to the next.

5. **Local Port & Origin Bindings:**
   - Web: localhost:3000
   - API: localhost:3001
   - Temporal Web UI: localhost:8233 / gRPC: localhost:7233
   - Ollama: localhost:11434
