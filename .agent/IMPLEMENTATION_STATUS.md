# Implementation Status — Ghost-Hunter

| Task ID | Description | Status | Verification / Notes |
|---------|-------------|--------|----------------------|
| TASK-001 | Init monorepo (pnpm workspaces, TS config, lint, .env.example) | DONE | Verified: `pnpm -r typecheck` clean; Next.js web build succeeded; worker/api compiled cleanly |
| TASK-002 | Shared schemas (Zod types/enums from DATA_MODEL) | DONE | Verified: complete domain schemas, enums, workflow states, and API contracts defined in `packages/shared/src/`; 14 unit tests passing with Vitest; workspace typecheck clean |
| TASK-003 | DB + migrations (Drizzle SQLite schema) | DONE | Verified: SQLite schema (`applications`, `followups`, `events`, `notifications`), indexes, Drizzle migrations generated, repository CRUD operations and cascade deletions verified via 6 integration tests in `apps/api/src/db/__tests__/db.test.ts` |
| TASK-004 | API CRUD (Application endpoints + validation + error shape) | DONE | Verified: Fastify REST routes (`POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id`, `GET :id/events`, `GET :id/followups`), Zod validation, standard error envelope `{ error: { code, message, fields? } }`, verified via 11 integration tests in `apps/api/src/routes/__tests__/applications.test.ts` |
| TASK-005 | Design tokens & fonts (Tailwind/CSS tokens per DESIGN_SYSTEM) | DONE | Verified: Google Fonts (`Bricolage Grotesque`, `Inter`, `JetBrains Mono`), CSS custom properties, noise grain overlay, hard shadows, editorial styles; `/tokens` validation page built and rendered statically |
| TASK-006 | Primitives (Display, Text, Button, Field, StatusChip, etc.) | DONE | Verified: Implemented Display, Text, MonoData, Button, LinkArrow, Field, StatusChip, Hairline, Grain, Section, and Counter in `apps/web/src/components/primitives/`; rendered in `/tokens` route; `next build` and workspace typecheck clean |
| TASK-007 | App shell (Layouts, nav, mock states) | DONE | Verified: Implemented `AppLayout`, `AppNavbar`, `MarketingLayout`, `MarketingNavbar`, `EmptyState`, `ErrorState`, `DegradedBanner`; built `/app` dashboard screen; verified with `next build` (6 static pages) and clean typecheck |
| TASK-008 | Applications UI (List, create stepper, detail wired to API) | DONE | Verified: TanStack Query API client and API rewrites; Applications list with status badges and metrics; 3-step creation wizard (Company, Strategy, Review); application detail view with follow-ups, timeline, and actions; Next.js build and typecheck passing |
| TASK-009 | Temporal infra (Dev server/compose, worker boot, API client) | TODO | Pending TASK-001 |
| TASK-010 | Workflow v1 (Wait loop, statuses, query, finalize) | TODO | Pending TASK-009, TASK-003 |
| TASK-011 | Signals + race guard (recruiterReplied, cancelHunt) | TODO | Pending TASK-010 |
| TASK-012 | Start/reply/cancel endpoints + duplicate protection | TODO | Pending TASK-011, TASK-004 |
| TASK-013 | Ollama client + draft activity (Prompt, JSON validation, retry) | TODO | Pending TASK-009 |
| TASK-014 | Draft decision flow (decisionSignal, review timeout, multi-stage) | TODO | Pending TASK-013, TASK-011 |
| TASK-015 | Draft review UI (DraftReviewPanel, StreamText) | TODO | Pending TASK-014, TASK-008 |
| TASK-016 | Notifications + SSE (Activity, feed, browser notification) | TODO | Pending TASK-014 |
| TASK-017 | Workflow UI (TrailTimeline, countdown, WorkflowPanel) | TODO | Pending TASK-015, TASK-016 |
| TASK-018 | Chaos/recovery tests (Worker & Temporal restart scenarios) | TODO | Pending TASK-017 |
| TASK-019 | Landing + motion (Scroll story, reveals, reduced-motion) | TODO | Pending TASK-006 |
| TASK-020 | Demo mode + seed (Seconds delays, seed/reset script) | TODO | Pending TASK-017 |
| TASK-021 | Polish + a11y/perf pass (WCAG AA, performance audit) | TODO | Pending TASK-019, TASK-020 |
| TASK-022 | README + screenshots + demo recording | TODO | Pending TASK-021 |
