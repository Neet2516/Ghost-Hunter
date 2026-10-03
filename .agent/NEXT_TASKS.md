# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-014: Draft decision flow**
  - Implement `draftDecision` signal (`approve`, `skip`, `snooze`), review timeout (`DEFAULT_REVIEW_TIMEOUT_MS`), and multi-stage workflow integration.
  - Wire `generateFollowUpDraft` into `ghostHunterWorkflow`, handle draft review gate, status transitions (`AWAITING_REVIEW`), and user notifications.
  - Add workflow time-skipping tests for draft approval, skip, snooze, and review expiration.

## Immediately Following Tasks:
1. **TASK-015: Draft review UI**
   - Create `DraftReviewPanel`, `StreamText`, and review action buttons wired to API signal endpoint.
