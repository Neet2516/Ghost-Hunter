# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-017: Workflow UI**
  - Implement `TrailTimeline` multi-stage timeline nodes (`DONE`, `ACTIVE`, `WAITING`, `SKIPPED`).
  - Implement `CountdownMono` high-precision cadence monospace countdown timer.
  - Implement `WorkflowPanel` temporal sentinel telemetry display (Workflow ID, Task Queue, run status, next timer).
  - Implement `ModelStatus` component displaying real-time local Gemma/Ollama status.
  - Implement `DegradedBanner` displaying graceful offline/template state warnings.
  - Integrate into Application detail view (`/app/applications/[id]`) and Dashboard.

## Immediately Following Tasks:
1. **TASK-018: Chaos/recovery tests**
   - Implement test scripts for Scenarios #5 & #6 (Worker restart, Temporal server restart).
   - Document recovery and zero-loss guarantees.

