# Technical & Architectural Decisions — Ghost-Hunter

## TD-01: Temporal for Orchestration
- **Decision:** Use Temporal TypeScript SDK (`@temporalio/*`) with dev server.
- **Reason:** Multi-day durable timers, crash survival, signal-driven interruption, determinism.
- **Trade-off:** Operational footprint managed via local dev server / docker-compose.

## TD-02: Local Model via Ollama
- **Decision:** Use local Gemma (`gemma3:4b` default or configured via `OLLAMA_MODEL`) with Ollama.
- **Reason:** Complete local privacy, offline operation, zero cost per token.
- **Trade-off:** Slower latency on low-end hardware; mitigated with prompt constraints, 90s timeout, 3 retries, and fallback template.

## TD-03: Monorepo with pnpm Workspaces
- **Decision:** Structure repo as `apps/web`, `apps/api`, `apps/worker`, and `packages/shared`.
- **Reason:** Single source of truth for Zod schemas and TypeScript types without code duplication.

## TD-04: SQLite with Drizzle ORM
- **Decision:** SQLite via `better-sqlite3` and Drizzle ORM in `apps/api`.
- **Reason:** Lightweight, zero configuration, zero cloud dependency, file-backed.

## TD-05: Next.js App Router for Web UI
- **Decision:** Next.js App Router with Tailwind CSS, Framer Motion, and TanStack Query.
- **Reason:** Clean file-based routing, rich animation capability, fast reactive client state.

## TD-06: Human-in-the-Loop Review Gate
- **Decision:** The workflow pauses at `AWAITING_REVIEW` with an activity notification and awaits explicit user signal (`draftDecision`).
- **Reason:** Prevents accidental or hallucinated outreach emails; guarantees user agency.
