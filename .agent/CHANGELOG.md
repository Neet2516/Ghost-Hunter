# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Created complete shared schemas in `@ghost-hunter/shared` (TASK-002):
  - Domain enums: `ApplicationStatus`, `SubStatus`, `FollowUpStatus`, `FollowUpSource`, `FollowUpDecisionAction`, `OutreachChannel`, `EventType`, `NotificationKind`.
  - Domain schemas: `ApplicationSchema`, `CreateApplicationSchema`, `UpdateApplicationSchema`, `FollowUpSchema`, `EventSchema`, `NotificationSchema`.
  - AI validation: `AIDraftOutputSchema` enforcing <= 120 words and rejecting bracket/brace/tag placeholder tokens (`[Name]`, `{Company}`).
  - API contracts: `ErrorResponseSchema`, `DraftDecisionRequestSchema`, `WorkflowStateResponseSchema`, `ModelHealthResponseSchema`, `MarkNotificationsReadRequestSchema`.
  - Vitest test suite with 14 passing unit tests covering all schema validations.
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
