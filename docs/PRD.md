# Ghost-Hunter — PRD

## 1. Overview
Autonomous, durable follow-up agent for internship/job outreach.

## 2. Problem
Applicants lose track of outreach and follow up late, inconsistently, or never.

## 3-5. Target user, persona, pains
**Persona:** Aarav, 3rd-year CS student, ~40 active outreach threads across email/LinkedIn. Pains: forgets follow-ups, awkward wording, unsure when it's "too soon", doesn't want career data in cloud tools.

## 6-8. Vision, goals, non-goals
- Vision: no application is ever silently ghosted by the user's own forgetfulness.
- Goals: reliable timed follow-up; zero-cloud AI; compelling demo of Temporal durability.
- Non-goals: CRM, team features, sending email in MVP, inbox scraping, mobile app, billing.

## 9. User stories
- US-1 Create an application with company, role, recruiter, outreach context.
- US-2 Set follow-up delay and max follow-ups.
- US-3 Be told when a draft is ready; edit/approve/skip it.
- US-4 Mark that a recruiter replied; hunt stops immediately.
- US-5 Cancel/pause a hunt.
- US-6 See why things happened (timeline).

## 10. Functional requirements
- FR-001 Create/edit/delete job application.
- FR-002 Configure follow-up delay (minutes/hours/days) and max follow-ups (1–3).
- FR-003 Starting a hunt starts one Temporal workflow, ID `gh-{applicationId}`.
- FR-004 Recruiter reply Signal ends the workflow with status REPLIED.
- FR-005 On timer expiry with no reply, workflow runs the draft Activity.
- FR-006 Draft Activity calls local Gemma via Ollama; returns structured JSON `{subject, body}`.
- FR-007 Workflow awaits user decision Signal (approve / edit+approve / skip / snooze) with a review timeout.
- FR-008 On approve, record follow-up as SENT (user sends manually; app copies text) and schedule next stage if any.
- FR-009 Cancel Signal stops workflow cleanly with status CANCELLED.
- FR-010 Dashboard shows all applications with live workflow state (via Query).
- FR-011 Event timeline per application persisted in DB.
- FR-012 In-app notifications for draft ready, failures, completion.
- FR-013 Duplicate start for same application is rejected.
- FR-014 Model health indicator (Ollama reachable, model present).
- FR-015 Demo mode: delay units in seconds.
- FR-016 If Ollama is down after retries, workflow enters DEGRADED, notifies user, offers template draft.

## 11. Non-functional
- NFR-001 Workflow survives worker and Temporal-server restart.
- NFR-002 No application data leaves the machine (except optional user-configured notification channel).
- NFR-003 Draft generation p95 < 30 s on 8 GB machine with 4B model.
- NFR-004 WCAG AA contrast, keyboard navigable, reduced-motion respected.
- NFR-005 One-command local start (`docker compose`/scripts).

## 12. Priority — see MVP.md
## 13. Application lifecycle
DRAFT → HUNTING → (REPLIED | CANCELLED | COMPLETED | FAILED); within HUNTING sub-states: WAITING, GENERATING, AWAITING_REVIEW, DEGRADED.
## 14. Follow-up lifecycle
PENDING → GENERATING → READY → (APPROVED/SENT | SKIPPED | SNOOZED | DISCARDED_REPLY).
## 15. AI requirements
Local only; JSON-constrained output; length ≤ 120 words; no fabricated facts; validated before use; one regeneration allowed by user.
## 16. Temporal requirements
Deterministic workflow; all I/O in Activities; Signals: `recruiterReplied`, `cancelHunt`, `draftDecision`; Query: `getState`; retry policies explicit; workflow ID uniqueness.
## 17. Notifications
In-app feed + browser Notification API. Email/push: FUTURE.
## 18-19. Privacy/Security
Local SQLite, Ollama on localhost, no telemetry, input validation (zod), API bound to localhost, CORS locked, secrets in `.env`, prompt-injection note: recruiter text is untrusted data in prompts.
## 20-21. Errors & edge cases
Reply during GENERATING (discard draft); reply at the instant timer fires; double Signal (idempotent); worker down at fire time (fires on return); user ignores draft (review timeout → reminder, then pause); malformed AI JSON (retry then fallback); cancel while GENERATING; deleting application with running workflow (cancel first).
## 22. Success metrics
Restart-resilience test passes; race test passes; demo < 3 min; ≥90% of drafts valid JSON on first try.
## 23. Demo requirements — see DEMO_SCRIPT.md
## 24. Future
Gmail/IMAP auto-detect, calendar, LinkedIn channel, analytics, tone profiles.
