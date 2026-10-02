# Architecture Context — Ghost-Hunter

## Architecture Overview
```
[ Next.js Web App ]
       │ REST / SSE
       ▼
[ Fastify API Server ] ── Drizzle ORM ──▶ [ SQLite DB ]
       │
       │ Temporal Client (Start, Signal, Query, Cancel)
       ▼
[ Temporal Server (:7233) ]
       │
       │ Task Queue: ghost-hunter
       ▼
[ Temporal Worker ]
       ├── Workflows (gh-{applicationId})
       └── Activities
             ├── generateFollowUpDraft ──▶ [ Ollama (:11434) / Gemma ]
             ├── updateApplicationStatus ──▶ [ SQLite DB ]
             ├── persistEvent ────────────▶ [ SQLite DB ]
             ├── notifyUser ──────────────▶ [ SQLite DB / SSE ]
             └── checkModelHealth ────────▶ [ Ollama (:11434) ]
```

## Workflows & Activities Contract
- **Workflow ID:** `gh-{applicationId}`
- **Task Queue:** `ghost-hunter`
- **Signals:**
  - `recruiterReplied`: Signals that a recruiter replied, terminating wait immediately.
  - `cancelHunt`: Gracefully cancels workflow.
  - `draftDecision`: Sends user choice `{ action: 'approve' | 'skip' | 'snooze', editedBody?: string }`.
- **Query:**
  - `getState`: Returns live workflow status, stage, timer status, and draft ID.
- **Workflow Determinism Rules:**
  - Workflow files in `apps/worker/src/workflows/` must only import from `@temporalio/workflow` and `@ghost-hunter/shared`.
  - Zero I/O, no node globals like `fetch`, `fs`, `crypto`, `Date.now()`, or `Math.random()`.
  - All side effects must reside strictly in Activities.

## Data Model (SQLite via Drizzle)
- `applications`: id, company, role, recruiterName, recruiterContact, outreachChannel, outreachContext, outreachSentAt, delayMs, maxFollowUps, status, subStatus, nextActionAt, workflowId, createdAt, updatedAt.
- `followups`: id, applicationId, stage, subject, body, source, status, editedBody, createdAt, decidedAt.
- `events`: id, applicationId, type, payload, at.
- `notifications`: id, applicationId, kind, message, readAt, createdAt.
