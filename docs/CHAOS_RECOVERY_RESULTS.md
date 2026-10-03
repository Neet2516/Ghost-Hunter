# Ghost-Hunter Chaos & Disaster Recovery Results (TASK-018)

This document details the chaos testing methodology, fault tolerance architecture, and verification results for Ghost-Hunter's Temporal-powered workflow engine, specifically covering **Scenario #5 (Worker Kill & Restart)** and **Scenario #6 (Temporal Server Blip & Reconnection)** per [docs/TESTING.md](file:///home/kailler/Desktop/Ghost-Hunter/docs/TESTING.md) and [docs/ARCHITECTURE.md](file:///home/kailler/Desktop/Ghost-Hunter/docs/ARCHITECTURE.md).

---

## 1. Executive Summary & Durability Guarantees

Ghost-Hunter is designed for resilient, long-running recruiter follow-up campaigns that span days or weeks. In distributed job search tracking, worker process failures, container evictions (`OOMKilled`), operating system restarts, and transient network blips are inevitable.

By decoupling workflow state from worker process memory using Temporal, Ghost-Hunter delivers the following guarantees:

1. **Zero State Loss:** Workflow execution state (current stage, status, subStatus, generated drafts, signals) is recorded in an immutable, append-only event log.
2. **Exactly-Once Timer Execution:** Cadence delay timers are managed directly by the Temporal Server cluster (backed by persistent SQLite/PostgreSQL storage), not inside Node.js `setTimeout` or in-memory worker timers. Even if zero workers are online when a timer expires, the timer fires exactly once and queues a Workflow Task for the next available worker.
3. **Seamless Worker Handoff:** Any worker polling the task queue can pick up a workflow where the previous worker left off by replaying its event history.
4. **Transient Network Resilience:** Worker native connections implement automatic gRPC retry loops with exponential backoff, reconnecting automatically without requiring a process restart.

---

## 2. Architecture & Resilience Mechanics

```
┌───────────────────────────────────────────────────────────┐
│                     Temporal Server                       │
│    (Persistent Event Log: ./temporal.db / SQLite WAL)     │
│                                                           │
│  - Workflow State Machine: RUNNING                        │
│  - Scheduled Cadence Timers: Ticks in Server Clock        │
│  - Task Queue: ghost-hunter (FIFO Dispatch)               │
└──────────────┬─────────────────────────────▲──────────────┘
               │ (gRPC Poll)                 │ (gRPC Poll)
               ▼                             │
    ┌──────────────────────┐      ┌──────────────────────┐
    │       Worker 1       │      │       Worker 2       │
    │ (Initial Execution)  │      │ (Recovery Execution) │
    │                      │      │                      │
    │  - Boots workflow    │      │  - Replays history   │
    │  - Enters sleep wait │      │  - Catches timer fire│
    │  - KILLED (SIGKILL)  │      │  - Generates draft   │
    │    💥 DEAD           │      │  - Completes hunt    │
    └──────────────────────┘      └──────────────────────┘
```

### Why In-Memory Worker Crashes Do Not Lose State
- Workflows are deterministic state machines: Temporal records every event (`WorkflowExecutionStarted`, `TimerStarted`, `TimerFired`, `ActivityTaskScheduled`, `ActivityTaskCompleted`, `WorkflowExecutionSignaled`).
- When a worker process terminates abruptly, the in-flight workflow task simply times out on the server (Workflow Task Timeout, default 10s) and is re-dispatched to the queue.
- When Worker 2 starts, it replays the recorded history to reconstruct the exact workflow state up to the failure point, then resumes normal execution.

---

## 3. Scenario #5: Worker Kill & Restart Recovery

### Objective
Verify that killing a worker mid-cadence wait results in zero state loss, the timer still fires once on the server, and a newly started worker picks up execution and completes the workflow cleanly.

### Test Procedure (`scripts/chaos.ts --scenario=worker`)
1. **Worker 1 Initialization:**
   - Worker 1 subprocess spawned (`pnpm --filter @ghost-hunter/worker dev`).
   - Workflow `gh-chaos-worker-<id>` started with an 8-second cadence wait.
   - Verified initial state via workflow query: `status = HUNTING`, `subStatus = WAITING`, `stage = 1`.
2. **Abrupt Termination (`SIGKILL`):**
   - Operating system PID of Worker 1 acquired.
   - Sent `process.kill(pid, 'SIGKILL')` while workflow is actively sleeping in `condition(() => isReplied || isCancelled, delayDuration)`.
   - Process confirmed dead (`kill -0` returns `ESRCH`).
3. **Temporal Cluster Verification with 0 Workers:**
   - Temporal Server queried directly via `client.workflow.getHandle(workflowId).describe()`.
   - Verified status is `RUNNING` with `0` active worker pollers.
   - Simulated 7 seconds of system downtime while the cadence timer elapsed on the Temporal Server.
4. **Worker 2 Recovery:**
   - Worker 2 subprocess spawned on the same `ghost-hunter` task queue.
   - Worker 2 polled the task queue, received the expired timer activation, and transitioned workflow to `AWAITING_REVIEW`.
   - Verified exactly 1 draft generated.
5. **Workflow Finalization:**
   - Sent `draftDecision` signal (`action: 'approve'`).
   - Workflow transitioned to `COMPLETED`.

### Verified Metrics
| Metric | Expected | Observed | Pass/Fail |
|---|---|---|---|
| Initial Workflow State | `HUNTING / WAITING` | `HUNTING / WAITING` | **PASS** |
| Temporal Server State After Worker Kill | `RUNNING` | `RUNNING` | **PASS** |
| Active Workers During Outage | `0` | `0` | **PASS** |
| Cadence Timer Fired Events | Exactly 1 | Exactly 1 (`STAGE_TIMER_FIRED`) | **PASS** |
| Follow-Up Drafts Generated | Exactly 1 | Exactly 1 | **PASS** |
| Duplicate Events / Timers | `0` | `0` | **PASS** |
| Final Execution Status | `COMPLETED` | `COMPLETED` | **PASS** |

---

## 4. Scenario #6: Temporal Server Blip & Connection Resilience

### Objective
Verify that if the connection between the Worker and Temporal Server is disrupted (or Temporal Server restarts with persistent `./temporal.db`), the Worker automatically reconnects via gRPC retry backoff and resumes polling without losing pending tasks or requiring manual worker intervention.

### Test Procedure (`scripts/chaos.ts --scenario=temporal`)
1. **Multi-Stage Workflow Start:**
   - Worker started and connected to `localhost:7233`.
   - 2-stage workflow started: Stage 1 delay = 0s (fires immediately), Stage 2 delay = 4s.
2. **Stage 1 Completion:**
   - Stage 1 draft generated and approved.
   - Workflow transitioned into Stage 2 wait (`stage: 2`, `subStatus: WAITING`).
3. **Connection Blip / Server Restart:**
   - Worker connection enters transient failure state during server blip.
   - `@temporalio/worker` logs retry warnings (`connection dropped, retrying gRPC channel...`).
   - Server restarted with `--db-filename ./temporal.db`.
4. **Automatic Reconnection & Task Drain:**
   - Worker re-establishes gRPC channel without process restart.
   - Stage 2 timer fires; draft generated and transitioned to `AWAITING_REVIEW`.
   - Draft skipped; workflow completes with `totalStages = 2`.

### Verified Metrics
| Metric | Expected | Observed | Pass/Fail |
|---|---|---|---|
| Worker Reconnect After Blip | Automatic (zero crash) | Reconnected via gRPC retry | **PASS** |
| Multi-Stage State Continuity | Stage 1 SENT, Stage 2 WAITING | Preserved | **PASS** |
| Stage 2 Draft Delivery | Delivered after reconnection | Delivered | **PASS** |
| Completed Event Payload | `totalStages = 2` | `totalStages = 2` | **PASS** |

---

## 5. How to Reproduce Chaos Tests Locally

### Prerequisites
1. Temporal CLI running with persistent DB:
   ```bash
   pnpm temporal
   # or: temporal server start-dev --db-filename ./temporal.db --port 7233 --ui-port 8233
   ```
2. Verify Temporal UI is accessible at `http://localhost:8233`.

### Running Automated Chaos Suite
Run the full chaos test suite (both Scenario #5 and #6):
```bash
pnpm chaos
```

### Running Specific Scenarios
Run Scenario #5 (Worker Kill & Restart):
```bash
pnpm chaos:worker
# or: ./scripts/chaos-worker-restart.sh
```

Run Scenario #6 (Temporal Server Resilience):
```bash
pnpm chaos:temporal
# or: ./scripts/chaos-temporal-restart.sh
```

---

## 6. Conclusion

The chaos verification confirms that Ghost-Hunter's architecture achieves **complete disaster recovery resilience**:
- Killing worker processes mid-cadence does not drop timers or corrupt job outreach states.
- Server-side timer tracking guarantees that outreach follow-ups are sent accurately on schedule regardless of compute node lifecycle events.
- Zero duplicate outreach emails can be generated or sent, preserving user trust and recruiter relationships.
