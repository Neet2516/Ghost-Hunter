# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-007: App shell**
  - Implement layouts and navigation in `apps/web/src/components/layout/`:
    - `MarketingLayout`: Lenis-ready, grain, editorial header/nav, full-screen overlay menu.
    - `AppLayout`: Slim top bar, navigation links (`Dashboard`, `Applications`, `Notifications`, `Settings`), model health dot indicator, notification bell with unread badge.
    - Domain placeholders and mock empty / error state screens (`EmptyState`, `ErrorState`, `DegradedBanner`).
  - Validate by mounting `/app` with mock state and verifying layout responsiveness.

## Immediately Following Tasks:
1. **TASK-008: Applications UI**
   - Wire application list, creation wizard stepper, and detail view to Fastify API (`/api/applications`).
2. **TASK-009: Temporal infra**
   - Configure local Temporal server, worker boot, and API Temporal client.
3. **TASK-010: Workflow v1**
   - Implement `ghostHunterWorkflow` with durable timer loop, status transitions, and query.
