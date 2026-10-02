# Antigravity Tasks (execute in order; update .agent/ after each)
Format: OBJ · DEP · AREAS · RESULT · VALIDATE · DONE

**TASK-001 Init monorepo** — OBJ pnpm workspaces, TS config, lint, `.env.example`. DEP none. AREAS root, apps/*, packages/shared. RESULT installs & typechecks. VALIDATE `pnpm -r typecheck`. DONE clean run.
**TASK-002 Shared schemas** — OBJ zod types/enums from DATA_MODEL. DEP 001. AREAS packages/shared. VALIDATE unit tests. DONE schemas exported.
**TASK-003 DB + migrations** — OBJ Drizzle SQLite schema. DEP 002. AREAS apps/api/db. VALIDATE migration runs; CRUD test. DONE tables exist.
**TASK-004 API CRUD** — OBJ application endpoints + validation + error shape. DEP 003. VALIDATE API tests (incl. invalid input). DONE.
**TASK-005 Design tokens & fonts** — DEP 001. AREAS apps/web/styles. RESULT tokens per DESIGN_SYSTEM. VALIDATE token page renders. 
**TASK-006 Primitives** — Display, Text, Button, Field, StatusChip, Section, Grain. DEP 005.
**TASK-007 App shell** — layouts, nav, empty/error states (mock). DEP 006.
**TASK-008 Applications UI** — list, create stepper, detail wired to API. DEP 004, 007. VALIDATE Playwright create flow.
**TASK-009 Temporal infra** — docker compose/dev server, worker boot, API Temporal client. DEP 001. VALIDATE worker connects.
**TASK-010 Workflow v1** — wait loop, statuses, query, finalize. DEP 009, 003. VALIDATE time-skip tests #1,2.
**TASK-011 Signals + race guard** — reply, cancel. DEP 010. VALIDATE tests #3,4,14.
**TASK-012 Start/reply/cancel endpoints + duplicate protection** — DEP 011, 004. VALIDATE #12.
**TASK-013 Ollama client + draft activity** — prompt builder, JSON validation, retries, fallback. DEP 009. VALIDATE #7,8,9,10 with stub.
**TASK-014 Draft decision flow** — decisionSignal, review timeout, multi-stage. DEP 013, 011.
**TASK-015 Draft review UI** — DraftReviewPanel, StreamText. DEP 014, 008.
**TASK-016 Notifications + SSE** — activity, feed, browser notification, query invalidation. DEP 014. VALIDATE #11.
**TASK-017 Workflow UI** — TrailTimeline, countdown, WorkflowPanel, DegradedBanner, model status. DEP 015, 016.
**TASK-018 Chaos/recovery tests** — scripts for #5,#6; document results. DEP 017.
**TASK-019 Landing + motion** — scroll story, reveals, reduced-motion. DEP 006.
**TASK-020 Demo mode + seed** — seconds delays, seed/reset script. DEP 017.
**TASK-021 Polish + a11y/perf pass** — DEP 019, 020.
**TASK-022 README + screenshots + demo recording** — DEP 021. DONE when README_PLAN satisfied with real screenshots.
