# Session Log — Ghost-Hunter

## 2026-10-02 — Session 1
- **Focus:** TASK-001 (Init Monorepo) and project initialization.
- **Actions:**
  - Configured user-space Node v20.18.0 and pnpm v12.8.1.
  - Established `.agent/` context infrastructure.
  - Scaffolding monorepo with pnpm workspaces for `apps/web`, `apps/api`, `apps/worker`, and `packages/shared`.
  - Configured approved build scripts for native dependencies.
  - Verified `pnpm -r typecheck` and `apps/web` Next.js production build.
  - Created git commits (`69dc3b0`, `c23912d`, `33d47db`) and pushed to `origin main`.

## 2026-10-03 — Session 2
- **Focus:** TASK-002 (Shared schemas).
- **Actions:**
  - Implemented modular shared schema files in `packages/shared/src/`.
  - Added Vitest unit test suite (14/14 passed).
  - Verified `pnpm -r typecheck` clean.
  - Created git commit (`43d13d9`) and pushed to `origin main`.

## 2026-10-03 — Session 3
- **Focus:** TASK-003 (DB + migrations).
- **Actions:**
  - Added Drizzle ORM SQLite schema for `applications`, `followups`, `events`, and `notifications`.
  - Generated initial migration and database factory.
  - Implemented typed `DatabaseRepository` in `apps/api/src/db/crud.ts`.
  - Added integration test suite (6/6 passing).
  - Created git commit (`4aec24c`) and pushed to `origin main`.

## 2026-10-03 — Session 4
- **Focus:** TASK-004 (API CRUD).
- **Actions:**
  - Built Fastify app factory and unified error handler.
  - Implemented application routes with Zod validation.
  - Added 11 API integration tests (11/11 passing). Total 31 tests passing across workspace.
  - Created git commit (`e6ebcc9`) and pushed to `origin main`.

## 2026-10-03 — Session 5
- **Focus:** TASK-005 (Design tokens & fonts).
- **Actions:**
  - Integrated Google Fonts into `apps/web/src/app/layout.tsx`.
  - Expanded `apps/web/src/app/globals.css` with core palette CSS variables and utilities.
  - Updated `apps/web/tailwind.config.ts`.
  - Created `/tokens` route (`apps/web/src/app/tokens/page.tsx`).
  - Created git commit (`cd37fdb`) and pushed to `origin main`.

## 2026-10-03 — Session 6
- **Focus:** TASK-006 (Primitives).
- **Actions:**
  - Added `cn` class utility in `apps/web/src/lib/utils.ts`.
  - Implemented full suite of design primitives in `apps/web/src/components/primitives/`.
  - Updated `/tokens` route to showcase and validate all primitives.
  - Verified Next.js static build (`5/5 pages generated`) and workspace typecheck clean.
  - Created git commit (`1cef79d`) and pushed to `origin main`.

## 2026-10-03 — Session 7
- **Focus:** TASK-007 (App shell).
- **Actions:**
  - Implemented `AppLayout` and `AppNavbar` in `apps/web/src/components/layout/`.
  - Implemented `MarketingLayout` and `MarketingNavbar` in `apps/web/src/components/layout/`.
  - Implemented `EmptyState`, `ErrorState`, and `DegradedBanner` in `apps/web/src/components/domain/`.
  - Built `/app` dashboard route with metrics counters and active sentinel stream.
  - Verified `next build` (6 static pages) and workspace typechecks clean.
  - Created git commit (`f2beeef`) and pushed to `origin main`.

## 2026-10-03 — Session 8
- **Focus:** TASK-008 (Applications UI).
- **Actions:**
  - Configured TanStack Query provider and client integration in `apps/web/src/lib/api.ts`.
  - Added API proxy rewrite rules in `apps/web/next.config.mjs` for seamless local dev API routing.
  - Implemented `/app/applications` with search filter, tabbed status chips, and responsive data table.
  - Implemented `/app/applications/new` with 3-step wizard (Role & Company, Recruiter & Context, Strategy & Cadence).
  - Implemented `/app/applications/[id]` with application detail, status bar, action buttons, follow-up log, and timeline.
  - Verified `next build` (8 static and dynamic pages) and workspace typechecks clean.
  - Created git commit (`3d19dd0`) and pushed to `origin main`.

## 2026-10-03 — Session 9
- **Focus:** TASK-009 (Temporal Infra).
- **Actions:**
  - Configured `docker-compose.yml` for local Temporal server with persistence and UI.
  - Installed Temporal CLI v1.9.1 to user environment and added `pnpm temporal` script.
  - Wired worker bootstrap in `apps/worker/src/worker.ts` with NativeConnection and graceful shutdown.
  - Created typed API Temporal client in `apps/api/src/temporal-client/index.ts` with start/signal/query helpers and conflict handling.
  - Added unit/integration test suites using `@temporalio/testing` in both `apps/worker` and `apps/api`.
  - All 35 workspace tests passing and `pnpm -r typecheck` clean.
  - Created git commit (`8d57f00`) and pushed to `origin main`.

## 2026-10-03 — Session 10
- **Focus:** TASK-010 (Workflow v1).
- **Actions:**
  - Implemented `ghostHunterWorkflow` with deterministic wait loop, stage iterations, status transitions, activity proxies, and `getState` Query.
  - Created worker database schema and connection module in `apps/worker/src/db/`.
  - Implemented activities for `updateApplicationStatus`, `persistEvent`, `notifyUser`, and `checkModelHealth`.
  - Created time-skipping workflow unit tests in `apps/worker/src/__tests__/workflow.test.ts`.
  - Verified 35 tests passing across monorepo and clean typecheck on all 4 packages.
  - Verified Next.js web build passes cleanly.
  - Created git commit (`f901fe7`) and pushed to `origin main`.

## 2026-10-03 — Session 11
- **Focus:** TASK-011 (Signals + race guard).
- **Actions:**
  - Added `recruiterRepliedSignal` and `cancelHuntSignal` definitions and handlers to `ghostHunterWorkflow`.
  - Replaced stage wait with `condition(() => isReplied || isCancelled, delayDuration)`.
  - Implemented race condition checks to cleanly discard drafts and finalize when signals arrive right around timer triggers.
  - Added time-skipping unit test scenarios #3 (reply), #4 (cancel), and #14 (race guard) to `apps/worker/src/__tests__/workflow.test.ts`.
  - Verified 39 tests passing across workspace, clean `pnpm -r typecheck`, and clean Next.js build.
  - Created git commit (`592b17a`) and pushed to `origin main`.

## 2026-10-03 — Session 12
- **Focus:** TASK-012 (Start/reply/cancel endpoints + duplicate protection).
- **Actions:**
  - Implemented `POST /api/applications/:id/start`, `POST /api/applications/:id/reply`, `POST /api/applications/:id/cancel`, and `GET /api/applications/:id/state`.
  - Added duplicate workflow protection (409 `WORKFLOW_ALREADY_RUNNING`) and 503 `TEMPORAL_UNAVAILABLE` error mapping.
  - Updated `buildApp` and routes to support `temporalClient` injection.
  - Added integration test suite in `apps/api/src/routes/__tests__/applications-workflow.test.ts` verifying Scenarios #1, #12, signals, and state.
  - Total 44 workspace tests passing, clean typechecks across all 4 packages, and clean Next.js build.
  - Created git commit (`3e785b0`) and pushed to `origin main`.

## 2026-10-03 — Session 13
- **Focus:** TASK-013 (Ollama client + draft activity).
- **Actions:**
  - Implemented prompt builder with quarantined `<DATA>` blocks, recruiter first name extraction, and anti-hallucination rules in `apps/worker/src/ollama/prompt.ts`.
  - Added Zod draft schema validation and markdown stripping in `validateAndParseDraft`.
  - Implemented multi-stage fallback template generator for graceful offline/degraded operations.
  - Implemented `OllamaClient` with model health inspection (`/api/tags`), temperature clamping ($\le 0.4$), 90s timeout, and `/api/chat` JSON generation in `apps/worker/src/ollama/client.ts`.
  - Implemented `generateFollowUpDraft` activity with retry handling, `RETRY` event logging, and fallback template generation on retry exhaustion.
  - Implemented `checkModelHealth` activity with offline and missing-model detection.
  - Added `ValidationConfigError` in `@ghost-hunter/shared` for non-retryable invalid activity arguments.
  - Aligned native `better-sqlite3` and `zod` dependencies in `apps/worker`.
  - Added comprehensive test suite in `apps/worker/src/__tests__/ollama.test.ts` verifying Scenarios #7, #8, #9, and #10.
  - Verified 57 workspace tests passing, `pnpm -r typecheck` passing across all 4 packages, and Next.js web build passing cleanly.
  - Created git commit (`9ea64cc`) and pushed to `origin main`.

## 2026-10-03 — Session 14
- **Focus:** TASK-014 (Draft decision flow).
- **Actions:**
  - Implemented `draftDecisionSignal` with actions `approve`, `skip`, `snooze`, supporting `editedBody` and `snoozeDurationMs`.
  - Wired `generateFollowUpDraft` and `updateFollowUp` activities into multi-stage cadence loop in `ghostHunterWorkflow.ts`.
  - Implemented human review gate in `AWAITING_REVIEW` with `DEFAULT_REVIEW_TIMEOUT_MS` (48 hours) timer and auto-skip fallback.
  - Implemented race condition checks discarding drafts (`DISCARDED_REPLY`) upon mid-review recruiter replies or cancellations.
  - Created Fastify endpoint `POST /api/applications/:id/decision` with Zod validation and Temporal signaling.
  - Added time-skipping workflow unit tests for draft approval, skip, snooze, timeout auto-skip, and review reply interruption in `apps/worker/src/__tests__/workflow.test.ts`.
  - Created git commit (`b13c934`) and pushed to `origin main`.

## 2026-10-03 — Session 15
- **Focus:** TASK-015 (Draft review UI).
- **Actions:**
  - Implemented `StreamText` typewriter character streaming animation component with reduced-motion preferences in `apps/web/src/components/animation/StreamText.tsx`.
  - Implemented `DraftReviewPanel` in `apps/web/src/components/domain/DraftReviewPanel.tsx` with stage indicator, Gemma / Template source badges, live word counter (120 words maximum), Stream View vs Edit Text mode toggle, clipboard copy, and action buttons (`Approve & Send`, `Skip Stage`, `Snooze 24h`).
  - Added typed TanStack Query client mutations in `apps/web/src/lib/api.ts` (`startHunt`, `replyHunt`, `cancelHunt`, `submitDecision`, `getWorkflowState`).
  - Integrated `DraftReviewPanel` and Sentinel orbit lifecycle controls into Application detail view (`/app/applications/[id]/page.tsx`).
  - Cleaned up internal shared package module resolution for bundler compatibility.
  - Verified 62 workspace tests passing, clean typechecks across all 4 packages, and Next.js production build passing with 8 static pages.
