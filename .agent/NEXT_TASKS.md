# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-008: Applications UI**
  - Implement full application management UI wired to Fastify API (`http://localhost:3001` / `/api/applications`):
    - `api/client.ts`: Typed client wrapper for API calls with TanStack Query.
    - `/app/applications`: Editorial table list with search, status filters, and empty state.
    - `/app/applications/new`: Stepped creation wizard (company & role -> recruiter & context -> cadence configuration).
    - `/app/applications/[id]`: Application detail view with header, controls (Start / Reply / Cancel), and event timeline.
  - Validate with Next.js build and typecheck.

## Immediately Following Tasks:
1. **TASK-009: Temporal infra**
   - Configure local Temporal server, worker boot, and API Temporal client.
2. **TASK-010: Workflow v1**
   - Implement `ghostHunterWorkflow` with durable timer loop, status transitions, and query.
3. **TASK-011: Signals + race guard**
   - Implement recruiter reply and cancel signals with deterministic race guard.
