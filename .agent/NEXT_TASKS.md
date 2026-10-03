# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-015: Draft review UI**
  - Create `DraftReviewPanel`, `StreamText`, and review action buttons (Approve, Skip, Snooze) wired to API `POST /api/applications/:id/decision`.
  - Provide inline editing for draft body before approval.
  - Integrate into Application detail view (`/app/applications/[id]`).

## Immediately Following Tasks:
1. **TASK-016: Notifications + SSE**
   - Implement activity, event feed, in-app browser notification, and query invalidation.
