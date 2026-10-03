# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Implemented Demo Mode Toggles and Database Seed Script (TASK-020):
  - Added interactive Demo Mode toggle (20s cadence delay) in `apps/web/src/components/domain/WorkflowPanel.tsx` next to the Arm Sentinel action button.
  - Updated `apps/web/src/app/app/applications/[id]/page.tsx` to pass `isDemoMode` to `api.startHunt(id, options)`.
  - Updated API route `POST /api/applications/:id/start` to automatically set cadence schedule to `[20, 20, 20]` (20 seconds) when demo mode is active and custom cadence is not provided.
  - Implemented standalone CLI and programmatically invokable seed script in `scripts/seed.ts` with `--reset` support (`pnpm seed` and `pnpm seed:reset`).
  - Pre-populated 6 rich realistic outreach records covering every status:
    1. Anthropic (`HUNTING (WAITING)`, 18s countdown remaining)
    2. Stripe (`HUNTING (AWAITING_REVIEW)`, pending draft + unread notification)
    3. Apple (`REPLIED`, technical screen offer from recruiter)
    4. Figma (`COMPLETED`, 2 follow-up stages approved and sent)
    5. Vercel (`CANCELLED`, user accepted competing offer)
    6. Netflix (`DRAFT`, ready for live "Arm Sentinel" demo with 20s delay)
  - Verified with 69 workspace tests, workspace typecheck, and Next.js production build.
- Implemented Landing Page & Motion System (TASK-019):
  - Installed `lenis` and `gsap` for marketing interactions.
  - Implemented `SmoothScrollProvider` in `apps/web/src/components/marketing/SmoothScrollProvider.tsx` with Lenis smooth scrolling (lerp 0.08) disabled on reduced motion, system media query sync, and user toggle context.
  - Implemented `HeroSection` in `apps/web/src/components/marketing/HeroSection.tsx` with high-impact editorial typography ("Silence is data."), live simulated Sentinel telemetry widget, real-time cadence ticking, and quick CTAs.
  - Implemented `ScrollStory` in `apps/web/src/components/marketing/ScrollStory.tsx` presenting an interactive 5-step journey (Apply, Wait, Signal, Follow-up, Review) with step tabs, detailed narrative, technical Temporal specifications, and simulated terminal previews.
  - Implemented `ArchitectureSection` in `apps/web/src/components/marketing/ArchitectureSection.tsx` detailing the three durability pillars (Temporal State Machine, Air-Gapped Local Gemma, Human Review Gate) and an architectural comparison matrix against standard cloud CRMs.
  - Implemented `InteractiveDraftSimulator` in `apps/web/src/components/marketing/InteractiveDraftSimulator.tsx` allowing interactive inspection of local Gemma prompt synthesis, word count tracking (120 words), and draft copying.
  - Implemented `CtaBanner` in `apps/web/src/components/marketing/CtaBanner.tsx` with high-contrast editorial styling and direct links to the application.
  - Verified full accessibility compliance, responsive layout, 69 workspace tests passing, clean typechecks, and Next.js static build passing with 9 static/dynamic pages.
- Implemented Chaos & Disaster Recovery Tests (TASK-018):
  - Created executable chaos harness in `scripts/chaos.ts` with CLI flags (`--scenario=worker`, `--scenario=temporal`, `--all`) and root `package.json` scripts (`pnpm chaos`, `pnpm chaos:worker`, `pnpm chaos:temporal`).
  - Created companion shell runner scripts `scripts/chaos-worker-restart.sh` and `scripts/chaos-temporal-restart.sh`.
  - Implemented Scenario #5 (Worker Kill & Restart Recovery): Spawns Worker 1, starts workflow with cadence timer, executes SIGKILL mid-wait, verifies Temporal Server preserves workflow state in `RUNNING` with 0 active workers, spawns Worker 2 after timer expiration, and verifies Worker 2 recovers workflow, generates draft, and completes execution with zero state loss and zero duplicate events.
  - Implemented Scenario #6 (Temporal Server Blip & Reconnection): Tests multi-stage execution across connection drops and server restarts against persistent SQLite database (`./temporal.db`), demonstrating automatic gRPC reconnection and task queue drain without worker process restart.
  - Authored comprehensive disaster recovery documentation in `docs/CHAOS_RECOVERY_RESULTS.md` detailing fault-tolerance mechanics, verified metrics, architecture diagrams, and reproduction steps.
  - Verified full workspace integrity: 69 tests passing (14 shared + 33 API + 22 worker), zero TypeScript errors across all 4 packages, and Next.js production build clean.
- Implemented Workflow UI and Cadence Telemetry (TASK-017):
  - Created `useCountdown` hook in `apps/web/src/hooks/useCountdown.ts` and `CountdownMono` component in `apps/web/src/components/domain/CountdownMono.tsx` with live 1s cadence ticking, accessible polite announcements, and pulse indicators.
  - Implemented `TrailTimeline` in `apps/web/src/components/domain/TrailTimeline.tsx` displaying the complete cadence journey (initial outreach, multi-stage progress nodes with status indicators, Gemma/Template badges, timestamps, and stage previews).
  - Implemented `WorkflowPanel` in `apps/web/src/components/domain/WorkflowPanel.tsx` displaying Temporal workflow ID with copy trigger, task queue, workflow and sub-status states, cadence countdown timer, and orbit action buttons (Arm Sentinel, Mark Replied, Cancel Hunt).
  - Implemented `ModelStatus` in `apps/web/src/components/domain/ModelStatus.tsx` displaying real-time local Gemma inference status, latency, and refresh trigger.
  - Upgraded application detail view (`/app/applications/[id]`) and Dashboard (`/app`) with live telemetry and query hooks.
  - Verified with 69 unit/integration/workflow tests, workspace typecheck, and Next.js production build.
- Implemented Notifications and SSE Event Stream (TASK-016):
  - Created typed `EventBus` singleton in `apps/api/src/events/bus.ts` and SSE endpoints `GET /api/events` and `GET /api/events/stream` with 15-second heartbeat pings.
  - Implemented Notification endpoints: `GET /api/notifications` (with `?unreadOnly=true` filtering) and `POST/PATCH /api/notifications/read` (supporting individual IDs and `all: true`).
  - Wired real-time event broadcasting into application CRUD, hunt lifecycle (`start`, `reply`, `cancel`), and draft decision routes.
  - Aligned worker notifications schema and updated `notifyUser` activity to insert `DRAFT_READY` notifications; wrapped in try-catch in `ghostHunterWorkflow.ts` to guarantee Scenario 11 compliance (non-fatal, logged, workflow continues).
  - Added unit and integration tests in `apps/api/src/routes/__tests__/notifications.test.ts` and workflow unit test in `apps/worker/src/__tests__/workflow.test.ts` (69 total tests passing).
  - Implemented `useEventStream` hook in `apps/web` with auto-reconnection, query cache invalidation, and HTML5 desktop browser notifications.
  - Implemented `/app/notifications` notifications feed ledger page with unread filter, mark-all-read action, and application jump links.
  - Connected live unread counter badge and background SSE connection to `AppNavbar`.
- Implemented Draft Review UI and Decision Actions (TASK-015):
  - Created `StreamText` typewriter character streaming component in `apps/web/src/components/animation/StreamText.tsx` with reduced-motion support and instant click reveal.
  - Implemented `DraftReviewPanel` in `apps/web/src/components/domain/DraftReviewPanel.tsx` with stage badge, fallback template alert, real-time word counter (120 words limit), Stream vs Edit toggle, clipboard copy, and decision action buttons (Approve & Send, Skip Stage, Snooze 24h).
  - Integrated `DraftReviewPanel` and Sentinel orbit lifecycle controls into Application detail view (`/app/applications/[id]`).
  - Added TanStack Query mutations for `startHunt`, `replyHunt`, `cancelHunt`, and `submitDecision` with query cache invalidation.
  - Verified with 62 unit/workflow tests, workspace typecheck, and Next.js production build.
- Implemented Draft Decision Flow and Review Gate (TASK-014):
  - Defined `draftDecisionSignal` with `action: 'approve' | 'skip' | 'snooze'`, `editedBody`, and `snoozeDurationMs`.
  - Implemented human review gate in `ghostHunterWorkflow` with `AWAITING_REVIEW` sub-status and `DEFAULT_REVIEW_TIMEOUT_MS` (48 hours default) timer.
  - Implemented `updateFollowUp` activity in `apps/worker/src/activities/index.ts` to update follow-up statuses (`SENT`, `SKIPPED`, `SNOOZED`, `DISCARDED_REPLY`) and edited body in SQLite.
  - Added race guard discarding drafts with `DISCARDED_REPLY` when recruiter replies or cancellation arrives during review.
  - Created Fastify endpoint `POST /api/applications/:id/decision` with Zod schema validation and Temporal signaling.
  - Added time-skipping workflow unit tests for approve, skip, snooze, timeout auto-skip, and review reply interruption in `apps/worker/src/__tests__/workflow.test.ts`.
  - Added API route test in `apps/api/src/routes/__tests__/applications-workflow.test.ts` (total 62 workspace tests passing).
- Implemented Ollama Client and Follow-up Draft Activity (TASK-013):
  - Created prompt builder with anti-hallucination rules, recruiter first name extraction, and quarantined `<DATA>` blocks in `apps/worker/src/ollama/prompt.ts`.
  - Created Zod validation schema enforcement and markdown stripping in `validateAndParseDraft`.
  - Implemented dependable multi-stage fallback templates adhering to word count and token restrictions.
  - Implemented `OllamaClient` in `apps/worker/src/ollama/client.ts` with health checks via `/api/tags`, temperature clamping ($\le 0.4$), 90s timeout, and `/api/chat` JSON generation.
  - Created `generateFollowUpDraft` and `checkModelHealth` activities in `apps/worker/src/activities/ollama.ts` supporting retry attempts, `RETRY` event logging, and fallback to `DEGRADED` templates on failure.
  - Exported `ValidationConfigError` in `@ghost-hunter/shared` for non-retryable invalid activity inputs.
  - Created unit and mock HTTP stub integration test suite in `apps/worker/src/__tests__/ollama.test.ts` covering Scenarios #7, #8, #9, and #10 (17 passing worker tests).
- Implemented Workflow Endpoints and Duplicate Protection (TASK-012):
  - Created Fastify endpoints: `POST /api/applications/:id/start`, `POST /api/applications/:id/reply`, `POST /api/applications/:id/cancel`, and `GET /api/applications/:id/state`.
  - Added 409 conflict protection against duplicate running workflows (`WORKFLOW_ALREADY_RUNNING`).
  - Added 503 error mapping for Temporal unreachable errors (`TEMPORAL_UNAVAILABLE`).
  - Added integration test suite in `apps/api/src/routes/__tests__/applications-workflow.test.ts` validating scenarios #1 and #12.
- Implemented Signals and Race Guard (TASK-011):
  - Defined and implemented `recruiterReplied` and `cancelHunt` signals in `ghostHunterWorkflow`.
  - Replaced fixed sleep with deterministic `condition()` wait interruption.
  - Implemented race condition guard handling signals arriving immediately before/after cadence timer expiry or during transition to `GENERATING`.
  - Added time-skipping unit test scenarios #3, #4, and #14 in `apps/worker/src/__tests__/workflow.test.ts`.
  - Added signal dispatch integration test in `apps/api/src/temporal-client/__tests__/client.test.ts`.
- Implemented Workflow v1 (TASK-010):
  - Created deterministic `ghostHunterWorkflow` in `apps/worker/src/workflows/ghostHunterWorkflow.ts` adhering strictly to sandbox rules.
  - Implemented multi-stage cadence loop with durable `sleep` timers, stage transitions, and `getState` Query handler.
  - Implemented activities for application status updates, audit event logging, user notifications, and health checks in `apps/worker/src/activities/`.
  - Added SQLite schema and connection helpers in worker for local activity writes.
  - Validated with time-skipping unit test suite in `apps/worker/src/__tests__/workflow.test.ts`.
- Implemented Temporal Infrastructure (TASK-009):
  - Created `docker-compose.yml` for local Temporal dev server with persistent SQLite volume and web UI (ports 7233 and 8233).
  - Configured root script `pnpm temporal` using installed Temporal CLI v1.9.1.
  - Implemented worker bootstrap with NativeConnection, configuration, and graceful SIGINT/SIGTERM handlers in `apps/worker/src/worker.ts`.
  - Implemented typed Fastify Temporal client in `apps/api/src/temporal-client/index.ts` with workflow start, signal helpers, state queries, and 409 duplicate conflict handling.
  - Added unit and integration test suites using `@temporalio/testing` with time-skipping environment.
- Implemented Applications UI and client integration in `apps/web` (TASK-008):
  - TanStack Query provider and typed API client wrapper in `apps/web/src/lib/api.ts` with Next.js API proxying.
  - Applications list view (`/app/applications`) with search, filter tabs, company metadata, and status badges.
  - Multi-step application creation wizard (`/app/applications/new`) with Company/Role info, Recruiter/Outreach context, and Cadence configuration.
  - Application detail view (`/app/applications/[id]`) with application metadata, quick controls, follow-up history, and audit event timeline.
- Implemented App Shell and Layout system in `apps/web` (TASK-007):
  - `AppLayout` and `AppNavbar` with active navigation tabs, model health indicator dot, notification bell with unread badge, and quick action "+ New Hunt".
  - `MarketingLayout` and `MarketingNavbar` with brand messaging and CTA.
  - Domain components: `EmptyState` with customized action triggers, `ErrorState` with retry support, and `DegradedBanner` for degraded Ollama alerting.
  - Scaffolded `/app` dashboard screen featuring metrics counters, Temporal sentinel status panel, and active hunt stream.
- Implemented full atomic UI primitive component suite in `apps/web/src/components/primitives` (TASK-006).
- Configured design system tokens, typography, and styles in `apps/web` (TASK-005).
- Implemented Fastify application CRUD endpoints and error handling in `apps/api` (TASK-004).
- Implemented SQLite database layer using Drizzle ORM and `better-sqlite3` in `apps/api/src/db` (TASK-003).
- Created complete shared schemas in `@ghost-hunter/shared` with 14 passing unit tests (TASK-002).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Created `.agent/` directory with full persistent context files.
