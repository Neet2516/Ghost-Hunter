# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-012: Start/reply/cancel endpoints + duplicate protection**
  - Implement API routes in Fastify:
    - `POST /api/applications/:id/start`: starts `ghostHunterWorkflow` with taskQueue `ghost-hunter` and ID `gh-{id}`; returns 409 if already running; updates status to `HUNTING`.
    - `POST /api/applications/:id/reply`: sends `recruiterReplied` signal with optional notes/repliedAt.
    - `POST /api/applications/:id/cancel`: sends `cancelHunt` signal with optional reason.
    - `GET /api/applications/:id/state`: queries Temporal `getState` combined with DB data.
  - Add API route integration tests validating duplicate 409 protection (Scenario #1 and #12) and signal dispatch.

## Immediately Following Tasks:
1. **TASK-013: Ollama client + draft activity**
   - Implement Ollama client with structured JSON output, prompt construction, Zod validation, retry policy, and fallback template.
