# Next Tasks — Ghost-Hunter

## Current Task:
- **TASK-018: Chaos/recovery tests**
  - Implement test scripts for Scenarios #5 & #6:
    - Scenario 5: Worker killed during wait loop -> restarted -> workflow resumes timer without losing state.
    - Scenario 6: Temporal server restart / network blip -> worker reconnects -> pending tasks drain.
  - Document recovery behavior, zero-loss guarantees, and reproducible verification steps.

## Immediately Following Tasks:
1. **TASK-019: Landing + motion**
   - Implement editorial landing page (`/`) with GSAP scroll story, waveform animations, reveals, and reduced-motion toggle.
2. **TASK-020: Demo mode + seed**
   - Implement seconds delays toggle (`DEMO_MODE_DEFAULT`) and seed/reset script (`pnpm seed`).


