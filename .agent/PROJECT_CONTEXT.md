# Project Context — Ghost-Hunter

## Summary
Ghost-Hunter is a durable, local-first follow-up agent for job and internship outreach.

## Core Problem
Applicants send dozens of outreach messages on LinkedIn, email, and job boards. Tracking responses manually via spreadsheets or calendar reminders fails when replies arrive unexpectedly, contexts are lost, or silence drags on.

## Solution
Each job application is registered as a durable **Temporal Workflow** (`gh-{applicationId}`). The workflow waits for a specified delay (days in production, seconds in demo mode). If a recruiter replies, a `recruiterReplied` signal terminates the hunt gracefully. If silence persists, a local Gemma model (via Ollama) generates a contextual follow-up draft for human review (approve / edit / skip / snooze).

## High-Level Tech Stack
- **Monorepo:** pnpm workspaces
- **Frontend (`apps/web`):** Next.js (App Router), Tailwind CSS, Framer Motion, GSAP, Lenis, TanStack Query
- **Backend API (`apps/api`):** Fastify, TypeScript, Zod, Drizzle ORM + SQLite
- **Workflow & Activities (`apps/worker`):** Temporal TypeScript SDK (`@temporalio/*`), Ollama HTTP client
- **Shared (`packages/shared`):** Zod schemas, domain types, enums, constants
- **AI Inference:** Local Ollama (`gemma3:4b` default)
- **Local Persistence:** SQLite (application data, events, drafts, notifications) + Temporal Server state
