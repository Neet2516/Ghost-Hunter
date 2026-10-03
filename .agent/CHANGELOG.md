# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
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
