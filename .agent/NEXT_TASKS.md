# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-016: Notifications + SSE**
  - Implement Fastify notification endpoints (`GET /api/notifications`, `PATCH /api/notifications/read`).
  - Implement SSE endpoint `GET /api/events/stream` with heartbeat and event bus.
  - Implement `notifyUser` activity proxy and DB event emission.
  - Implement `useEventStream` hook in `apps/web` with automatic TanStack Query invalidation.
  - Implement `/app/notifications` page and `AppNavbar` unread notification counter & desktop notification prompt.

## Immediately Following Tasks:
1. **TASK-017: Workflow UI**
   - Implement `TrailTimeline`, `CountdownMono`, `WorkflowPanel`, and `ModelStatus`.
   - Integrate into `/app/applications/[id]` and dashboard.
