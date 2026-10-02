# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-010: Workflow v1**
  - Implement `ghostHunterWorkflow` in `apps/worker/src/workflows/ghostHunterWorkflow.ts` (deterministic wait loop, status activities `updateApplicationStatus`, `persistEvent`, and `getState` Query).
  - Create activities for database and status persistence.
  - Implement time-skipping workflow unit tests in `apps/worker/src/__tests__/workflow.test.ts`.

## Immediately Following Tasks:
1. **TASK-011: Signals + race guard**
   - Implement recruiter reply and cancel signals with deterministic race guard.
