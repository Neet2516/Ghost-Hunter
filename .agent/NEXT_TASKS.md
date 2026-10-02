# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-004: API CRUD**
  - Implement Fastify REST routes in `apps/api/src/routes/`:
    - Application CRUD endpoints: `POST /api/applications`, `GET /api/applications`, `GET /api/applications/:id`, `PATCH /api/applications/:id`, `DELETE /api/applications/:id`.
    - Integration with Zod request validation and error envelope `{ error: { code, message, fields? } }`.
    - Unit/integration API route tests including invalid input validations.

## Immediately Following Tasks:
1. **TASK-005: Design tokens & fonts**
   - Configure typography, design tokens, and CSS variables in `apps/web/styles`.
2. **TASK-006: Primitives**
   - Implement Display, Text, Button, Field, StatusChip, and Section components.
3. **TASK-007: App shell**
   - Implement MarketingLayout, AppLayout, navigation, and mock empty/error states.
