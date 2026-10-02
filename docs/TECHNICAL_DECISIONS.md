# Technical Decisions
Format: CONTEXT / OPTIONS / DECISION / REASON / TRADE-OFFS / STATUS (all ACCEPTED unless noted).

**TD-01 Temporal** — Ctx: multi-day durable waits + interrupts. Opt: cron+DB, BullMQ, Temporal. Dec: Temporal (TypeScript SDK) with local dev server. Why: required by blueprint; best fit. Trade: operational weight.
**TD-02 Local model** — Opt: cloud LLM, local. Dec: Gemma via Ollama (`gemma3:4b` default; env `OLLAMA_MODEL`). Why: privacy, cost, offline. Trade: slower, weaker output → validation + fallback. Note: verify exact model tag with `ollama list` at build time.
**TD-03 Frontend** — Dec: Next.js (App Router) + TypeScript + Tailwind. Why: Antigravity familiarity, routing, SSR for landing. 
**TD-04 Backend** — Dec: Fastify + TypeScript, zod validation, same monorepo as worker (shared types).
**TD-05 Database** — Dec: SQLite + Drizzle. Why: zero-setup, local-first. Trade: single-writer; fine for single user. (Temporal dev server keeps its own store.)
**TD-06 Auth** — Dec: none in MVP; bind to localhost. Status: revisit for deploy.
**TD-07 Notifications** — Dec: DB feed + SSE + Browser Notification API.
**TD-08 State mgmt** — Dec: TanStack Query for server state; URL + local state otherwise; no Redux.
**TD-09 API** — REST/JSON + SSE; contracts in IMPLEMENTATION_GUIDE.
**TD-10 Deployment** — Dec: local-first via docker compose (temporal, ollama optional host) + scripts; no cloud deploy for MVP; demo recorded locally.
**TD-11 Testing** — Vitest; `@temporalio/testing` time-skipping env for workflows; Playwright for key UI flows; mocked Ollama via local stub server.
**TD-12 Motion** — Framer Motion (UI state), GSAP+ScrollTrigger (scroll story), Lenis (smooth scroll, landing only).
