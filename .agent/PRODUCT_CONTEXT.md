# Product Context — Ghost-Hunter

## Target User Persona
- **Aarav**: 3rd-year CS student with ~40 active outreach threads across email and LinkedIn.
- **Pain points:** Forgets who to follow up with, worries about follow-up cadence ("is 3 days too pushy?"), struggles with drafting polite nudges, refuses to upload personal recruiter data or email credentials to third-party cloud CRMs.

## Core Features (MVP)
1. **Application CRUD:** Track company, role, recruiter name & contact, outreach channel, initial message summary, and timestamps.
2. **Cadence Configuration:** Set follow-up delays (days/hours or seconds in demo mode) and max follow-up count (1 to 3 stages).
3. **Durable Temporal Hunts:** Starts workflow `gh-{applicationId}`. Survives app/worker restarts.
4. **Recruiter Reply Signal:** Marking "Replied" immediately cancels waiting timers, logs event, and closes hunt as `REPLIED`.
5. **Local Gemma AI Drafts:** On timer expiry, generates structured follow-up drafts (`{subject, body}`) locally via Ollama.
6. **Human Review Gate:** User reviews, edits, approves, snoozes, or skips the draft. Nothing is automatically sent.
7. **Degraded Mode Resilience:** If Ollama is offline or fails after 3 retries, falls back to static template drafts without crashing.
8. **Live Event Timeline & Dashboard:** Shows real-time statuses and event trails driven by SSE and Temporal Query.
9. **Demo Time-Skip Mode:** Configurable delay units in seconds for quick end-to-end demonstrations.
