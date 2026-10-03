# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-013: Ollama client + draft activity**
  - Implement Ollama client with structured JSON output, prompt construction, Zod validation, retry policy, and fallback template.
  - Create `generateFollowUpDraft` activity in `apps/worker/src/activities/ollama.ts`.
  - Validate with prompt builder tests and mock Ollama stub (Scenarios #7, #8, #9, #10).

## Immediately Following Tasks:
1. **TASK-014: Draft decision flow**
   - Implement `draftDecision` signal (`approve`, `skip`, `snooze`), review timeout, and multi-stage execution.
