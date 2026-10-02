# Ghost-Hunter — Idea

**One line:** A durable, local-first agent that tracks job/internship outreach, waits for recruiters, and drafts follow-ups only when silence persists.

## Problem
Applicants send dozens of messages and lose track of who replied, who was followed up, and when. Spreadsheets and calendar reminders are passive: they don't know a reply arrived, don't survive context loss, and don't draft anything.

## Solution
Each application becomes a **Temporal workflow** that sleeps durably for N days. A recruiter reply is a **Signal** that ends the hunt. Silence triggers a **local Gemma (via Ollama) Activity** that drafts a follow-up for the user to review.

## Why Temporal / Local AI
- **Temporal:** timers measured in days must survive crashes and restarts; replies must interrupt waits safely; retries and cancellation come built in. A cron + CRUD app cannot do this cleanly.
- **Local Gemma + Ollama:** career data (recruiter names, outreach text) stays on-device; no API keys, no per-token cost, demo works offline.

## Original → Improved
| Original | Improved | Why | Class |
|---|---|---|---|
| Wait then follow up | Multi-stage cadence (max 3) with per-stage delay | Real follow-up behavior | SHOULD |
| Auto-generate follow-up | Human review gate (approve/edit/skip) before "sent" | Trust, avoids bad auto-sends | MUST |
| Reply = stop | Reply Signal + manual "mark replied" + race-safe handling | Required correctness | MUST |
| Implicit status | Explicit status machine mirrored from workflow Query | Single truth in UI | MUST |
| Nothing on failure | Retry policy + visible degraded state ("Ollama offline") + template fallback | Resilience demo | MUST |
| — | Demo "time-skip" mode (delays in seconds) | Demonstrable in 3 min | MUST |
| — | Event timeline per application | Storytelling + audit | SHOULD |
| — | Email sending / inbox parsing | Scope + privacy | OUT (MVP) / FUTURE |
| — | Multi-user, teams, CRM features | Scope creep | OUT OF SCOPE |

## Philosophy
Silence is data. The agent proposes; the human decides. Local by default.

## Future
Gmail/IMAP reply detection (auto-Signal), LinkedIn drafts, tone profiles, analytics on response rates.
