# Application Flow
```mermaid
flowchart TD
 A[Open app] --> B[Dashboard] --> C[Create application]
 C --> D[Company, role, recruiter, outreach context]
 D --> E[Configure follow-up] --> F[Start Ghost-Hunter]
 F --> G[Workflow gh-id started] --> H[Durable wait]
 H -->|Reply signal| I[Close: REPLIED]
 H -->|Timer expires| J[Gemma activity] --> K[Draft ready] --> L[User review]
 L -->|approve| M[Mark SENT, next stage or COMPLETED]
 L -->|skip/snooze| H
 L -->|timeout| N[Reminder then pause]
```
## Application lifecycle
```mermaid
stateDiagram-v2
 [*] --> DRAFT --> HUNTING --> REPLIED
 HUNTING --> CANCELLED
 HUNTING --> COMPLETED
 HUNTING --> FAILED
```
## Follow-up lifecycle
```mermaid
stateDiagram-v2
 [*] --> PENDING --> GENERATING --> READY
 READY --> SENT
 READY --> SKIPPED
 READY --> SNOOZED --> PENDING
 GENERATING --> DISCARDED_REPLY
 READY --> DISCARDED_REPLY
```
## Recruiter signal flow
```mermaid
sequenceDiagram
 User->>API: POST /applications/:id/reply
 API->>DB: insert event REPLY_SIGNAL (idempotent)
 API->>Temporal: signal recruiterReplied
 Temporal->>Workflow: set replied=true (wakes condition)
 Workflow->>Activity: updateApplicationStatus(REPLIED)
```
## AI generation flow
```mermaid
flowchart LR
 W[Workflow] --> A[generateFollowUpDraft]
 A --> P[Build prompt] --> O[Ollama JSON] --> V{zod valid?}
 V -- yes --> R[Return draft]
 V -- no --> X[Retry up to 3] --> F[Fallback template + DEGRADED]
```
## Cancellation flow
```mermaid
flowchart LR
 U[Cancel click] --> API --> S[signal cancelHunt] --> W[condition wakes] --> D[discard pending draft] --> F[finalize CANCELLED + event]
```
## Race condition (reply right before timer)
Workflow checks `replied` after every await including after the draft activity. Reply wins if the signal is processed before the draft is committed; the draft is marked DISCARDED_REPLY and no notification is raised. Temporal orders signals and timers deterministically in history.
## Error/retry flow — see ARCHITECTURE.md.
