# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-009: Temporal Infra**
  - Configure local Temporal server setup (`docker-compose.yml` or script with persistent SQLite `--db-filename ./temporal.db`).
  - Wire worker bootstrap in `apps/worker/src/worker.ts` and API Temporal client in `apps/api/src/temporal/`.
  - Validate worker connection and queue readiness.

## Immediately Following Tasks:
1. **TASK-010: Workflow v1**
   - Implement `ghostHunterWorkflow` with durable timer loop, status transitions, and query.
2. **TASK-011: Signals + race guard**
   - Implement recruiter reply and cancel signals with deterministic race guard.
