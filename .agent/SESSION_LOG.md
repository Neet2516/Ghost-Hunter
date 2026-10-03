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
  - Verified 62 workspace tests passing, clean typechecks across all 4 packages, and Next.js production build passing with 8 static pages.
  - Created git commit (`a5d0127`) and pushed to `origin main`.

## 2026-10-03 — Session 16
- **Focus:** TASK-016 (Notifications + SSE).
- **Actions:**
  - Built typed `EventBus` singleton in `apps/api/src/events/bus.ts` and SSE endpoint `GET /api/events` with heartbeat pings every 15s.
  - Built Fastify notification routes `GET /api/notifications` and `POST/PATCH /api/notifications/read`.
  - Wired real-time event broadcasting into application mutations and workflow signals.
  - Aligned worker notifications schema and updated `notifyUser` activity to insert `DRAFT_READY` notifications; wrapped in try-catch in `ghostHunterWorkflow.ts` to guarantee Scenario 11 compliance (non-fatal, logged, workflow continues).
  - Added unit and integration tests in `apps/api/src/routes/__tests__/notifications.test.ts` and workflow unit test in `apps/worker/src/__tests__/workflow.test.ts` (69 total tests passing).
  - Implemented `useEventStream` hook in `apps/web` with auto-reconnection, query cache invalidation, and HTML5 desktop browser notifications.
  - Implemented `/app/notifications` notifications feed ledger page with unread filter, mark-all-read action, and application jump links.
  - Verified 69 workspace tests passing, clean typechecks across all 4 packages, and Next.js production build passing with 9 static pages.
  - Created git commit (`d20d91c`) and pushed to `origin main`.

## 2026-10-03 — Session 17
- **Focus:** TASK-017 (Workflow UI).
- **Actions:**
  - Implemented `useCountdown` hook in `apps/web/src/hooks/useCountdown.ts` and `CountdownMono` component in `apps/web/src/components/domain/CountdownMono.tsx` with live 1s cadence countdown, accessible polite announcements, and pulse indicators.
  - Implemented `TrailTimeline` in `apps/web/src/components/domain/TrailTimeline.tsx` displaying the complete multi-stage cadence journey (initial outreach sent, multi-stage progress nodes with status indicators, Gemma/Template badges, timestamps, and stage previews).
  - Implemented `WorkflowPanel` in `apps/web/src/components/domain/WorkflowPanel.tsx` displaying Temporal workflow ID with copy trigger, task queue, workflow and sub-status states, cadence countdown timer, and orbit action buttons (Arm Sentinel, Mark Replied, Cancel Hunt).
  - Implemented `ModelStatus` in `apps/web/src/components/domain/ModelStatus.tsx` displaying real-time local Gemma inference status, latency, and refresh trigger.
  - Upgraded application detail view (`/app/applications/[id]`) and Dashboard (`/app`) with live telemetry and query hooks.
  - Verified 69 workspace tests passing, clean typechecks across all 4 packages, and Next.js production build passing with 9 static pages.
  - Created git commit (`78e4fb0`) and pushed to `origin main`.

## 2026-10-03 — Session 18
- **Focus:** TASK-018 (Chaos/recovery tests).
- **Actions:**
  - Implemented automated chaos test harness in `scripts/chaos.ts` with support for CLI flags (`--scenario=worker`, `--scenario=temporal`, `--all`) and root `package.json` scripts (`pnpm chaos`, `pnpm chaos:worker`, `pnpm chaos:temporal`).
  - Added companion shell scripts `scripts/chaos-worker-restart.sh` and `scripts/chaos-temporal-restart.sh` with executable permissions.
  - Implemented Scenario #5 (Worker Kill & Restart Recovery): Spawns Worker 1 subprocess, starts workflow with 8s cadence delay, kills Worker 1 abruptly via SIGKILL mid-wait, verifies Temporal Server cluster preserves workflow state in `RUNNING` with 0 active workers, waits for cadence timer to fire on server, spawns Worker 2 subprocess, and verifies Worker 2 recovers the expired timer, generates draft, and completes execution with zero state loss and zero duplicate events.
  - Implemented Scenario #6 (Temporal Server Blip & Reconnection): Tests multi-stage execution across connection drops and server restarts against persistent SQLite database (`./temporal.db`), demonstrating automatic gRPC reconnection and task queue drain without worker process restart.
  - Verified 69 workspace tests passing, zero TypeScript errors across all 4 packages, and Next.js production build passing with 9 static pages.
  - Created git commit (`a0ee3d6`) and pushed to `origin main`.

## 2026-10-03 — Session 19
- **Focus:** TASK-019 (Landing + motion).
- **Actions:**
  - Added `lenis` and `gsap` dependencies to `@ghost-hunter/web`.
  - Built `SmoothScrollProvider` in `apps/web/src/components/marketing/SmoothScrollProvider.tsx` configuring Lenis smooth scrolling (lerp 0.08) disabled on reduced-motion with an on-page toggle and system media query sync.
  - Built `HeroSection` in `apps/web/src/components/marketing/HeroSection.tsx` with high-impact editorial typography ("Silence is data."), live simulated Sentinel telemetry widget, real-time cadence ticker, and quick CTAs.
  - Built `ScrollStory` in `apps/web/src/components/marketing/ScrollStory.tsx` showcasing the 5-step journey (Apply, Wait, Signal, Follow-up, Review) with step selection tabs, rich narrative, technical Temporal specifications, and simulated terminal previews.
  - Built `ArchitectureSection` in `apps/web/src/components/marketing/ArchitectureSection.tsx` detailing the three durability pillars (Temporal State Machine, Air-Gapped Local Gemma, Human Review Gate) and an architectural comparison matrix against standard cloud CRMs.
  - Built `InteractiveDraftSimulator` in `apps/web/src/components/marketing/InteractiveDraftSimulator.tsx` allowing interactive inspection of local Gemma prompt synthesis, word count tracking (120 words), and draft copying.
  - Built `CtaBanner` in `apps/web/src/components/marketing/CtaBanner.tsx` with high-contrast editorial styling and direct links to the application.
  - Assembled complete landing page in `apps/web/src/app/page.tsx` wrapped in `SmoothScrollProvider` and `MarketingLayout`.
  - Verified 69 workspace tests passing, zero TypeScript errors across all 4 packages, and Next.js production build passing with 9 static/dynamic pages.
  - Created git commit (`fc37db6`) and pushed to `origin main`.

## 2026-10-03 — Session 20
- **Focus:** TASK-020 (Demo mode + seed).
- **Actions:**
  - Added interactive Demo Mode toggle (20s delays) in `apps/web/src/components/domain/WorkflowPanel.tsx` next to the Arm Sentinel action button.
  - Updated `apps/web/src/app/app/applications/[id]/page.tsx` to forward `isDemoMode` to `api.startHunt(id, options)`.
  - Updated API route `POST /api/applications/:id/start` in `apps/api/src/routes/applications.ts` to automatically default cadence schedule to `[20, 20, 20]` (20 seconds) when demo mode is active.
  - Implemented standalone CLI and programmatically invokable seed script in `scripts/seed.ts` with `--reset` support (`pnpm seed` and `pnpm seed:reset`).
  - Pre-populated 6 rich realistic outreach records covering every status: Anthropic (`HUNTING (WAITING)` with 18s countdown), Stripe (`HUNTING (AWAITING_REVIEW)` with pending draft and unread notification), Apple (`REPLIED` with interview invitation note), Figma (`COMPLETED` with 2 sent follow-up stages), Vercel (`CANCELLED` with competing offer rationale), and Netflix (`DRAFT` ready for live demonstration with 20s delay).
  - Added root `package.json` scripts `"seed"` and `"seed:reset"`.
  - Verified 69 workspace tests passing, zero TypeScript errors across all 4 packages, and Next.js production build passing with 9 static/dynamic pages.
  - Created git commit (`bbd55ca`) and pushed to `origin main`.

## 2026-10-03 — Session 21
- **Focus:** TASK-021 (Polish + a11y/perf pass).
- **Actions:**
  - Added accessible fixed skip-to-main-content link in `AppLayout.tsx` and `MarketingLayout.tsx` targeting `<main id="main-content">`.
  - Added global `:focus-visible` styling (`outline: 2px solid var(--signal)`) across inputs, buttons, and links.
  - Implemented `@media (prefers-reduced-motion: reduce)` overrides disabling animations, transitions, and smooth scrolling for users requesting reduced motion.
  - Added descriptive `aria-label` attributes to navigation elements, icon-only buttons (Workflow ID copy trigger, ModelStatus refresh trigger, notification bell, edit/stream view toggles), and draft review textarea.
  - Expanded root layout `metadata` with OpenGraph metadata, locale, viewport settings, theme-color `#0E0E10`, and SEO discovery keywords.
  - Verified 69 workspace tests passing, zero TypeScript errors across all 4 packages, and Next.js production build passing with 9 static/dynamic pages.
  - Created git commit (`20b6439`) and pushed to `origin main`.

## 2026-10-03 — Session 22
- **Focus:** TASK-022 (README + screenshots + demo recording).
- **Actions:**
  - Authored comprehensive root `README.md` (300+ lines) fulfilling all specifications from `docs/README_PLAN.md`.
  - Implemented automated screenshot runner in `scripts/capture-screenshots.js` using headless Chrome and captured 5 real high-resolution screenshots in `docs/screenshots/`:
    - `landing_page.png` (Landing hero with tactile grain, typography, and live simulated telemetry)
    - `dashboard_applications.png` (Applications ledger showcasing all 6 lifecycle statuses)
    - `review_draft_panel.png` (Draft review gate with typewriter text stream and word counter)
    - `sentinel_telemetry_orbit.png` (Cadence telemetry orbit with live countdown and timeline)
    - `notifications_feed.png` (Notifications ledger and real-time SSE event stream)
  - Updated `scripts/seed.ts` with standard RFC 4122 UUID identifiers to ensure strict API route parameter schema compliance.
  - Detailed the Temporal State Machine architecture, local Gemma/Ollama air-gapped zero-cloud privacy guarantees, and chaos testing results.
  - Documented the 60-second live demo workflow and step-by-step Quickstart guide.
  - Verified 69 workspace tests passing, zero TypeScript errors across all 4 packages, and Next.js production build passing with 9 static/dynamic pages.
  - Created git commit (`cbf9943`) and pushed to `origin main`.

## 2026-10-03 — Session 23
- **Focus:** Settings & Environment Diagnostics Page (`/app/settings`).
- **Actions:**
  - Resolved 404 on `/app/settings` by implementing `apps/web/src/app/app/settings/page.tsx` following `docs/PAGE_FLOW.md` and `docs/COMPONENT_ARCHITECTURE.md`.
  - Added Fastify system diagnostics routes: `GET /api/system/model-status` and `POST /api/system/test-generate`.
  - Updated web API client (`apps/web/src/lib/api.ts`) with typed methods `getModelStatus`, `testGenerate`, and `getHealth`.
  - Implemented interactive inference probe, local storage demo mode toggle, browser desktop notification permission requester, and cluster telemetry indicators.
  - Captured high-resolution screenshot `docs/screenshots/settings_page.png` and updated `README.md`.
  - Verified 69 workspace tests passing, zero TypeScript errors, and Next.js static build generating 10/10 pages.


