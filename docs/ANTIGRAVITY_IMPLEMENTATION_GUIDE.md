# Antigravity Implementation Guide (contract)
Read AGENTS.md first. This describes WHAT to build; it contains no implementation.

1. **Build:** Ghost-Hunter MVP per docs/MVP.md (MUST + SHOULD as time allows).
2. **Do NOT change:** Temporal as orchestrator; AI only in Activities; local Gemma via Ollama; workflow determinism rules; human review gate; localhost-only data; scope exclusions in PRD non-goals.
3. **Stack:** Node 20+, TypeScript, pnpm workspaces; Next.js App Router, Tailwind, Framer Motion, GSAP, Lenis, TanStack Query; Fastify, zod, Drizzle + SQLite; `@temporalio/*` SDK; Ollama; Vitest, Playwright.
4-5. **Architecture / structure:** ARCHITECTURE.md, FILE_STRUCTURE.md.
6-9. **Pages, components, design, animation:** PAGE_FLOW, COMPONENT_ARCHITECTURE, DESIGN_SYSTEM, ANIMATION_SYSTEM.
10. **Data:** DATA_MODEL.md.
11. **API (REST, JSON, zod-validated):**
- `POST /api/applications` · `GET /api/applications` · `GET/PATCH/DELETE /api/applications/:id`
- `POST /api/applications/:id/start` (409 if running)
- `POST /api/applications/:id/reply` · `POST /api/applications/:id/cancel`
- `POST /api/applications/:id/followups/:fid/decision` body `{action: approve|skip|snooze, editedBody?}`
- `POST /api/applications/:id/followups/regenerate`
- `GET /api/applications/:id/state` (Temporal Query + DB)
- `GET /api/events` (SSE) · `GET /api/notifications` · `POST /api/notifications/read`
- `GET /api/model/health` · `POST /api/model/test`
Error shape `{error:{code,message,fields?}}`.
12-14. **Temporal / workflow / activity:** ID `gh-{applicationId}`; task queue `ghost-hunter`; signals `recruiterReplied`, `cancelHunt`, `draftDecision`; query `getState`; workflow pseudocode in ARCHITECTURE.md; activities `generateFollowUpDraft`, `persistEvent`, `updateApplicationStatus`, `notifyUser`, `checkModelHealth`; retry policies as specified; no I/O or nondeterminism in workflow code.
15-16. **AI/Ollama:** HTTP to `OLLAMA_BASE_URL/api/chat` with JSON format; model from `OLLAMA_MODEL`; temperature ≤0.4; timeout 90s; validate with zod; prompts keep user/recruiter text as quoted data; template fallback.
17. **Env:** `DATABASE_URL`, `TEMPORAL_ADDRESS` (localhost:7233), `TEMPORAL_NAMESPACE`, `TASK_QUEUE`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `API_PORT`, `WEB_ORIGIN`, `DEMO_MODE_DEFAULT`.
18. **Testing:** TESTING.md (all 14 scenarios).
19. **Security:** validate all input; localhost bind; no secrets in repo; escape rendered text; treat AI output as untrusted.
20. **Accessibility:** semantic HTML, focus rings, AA contrast, reduced motion, aria-live for status changes.
21-22. **Responsive/perf:** mobile-first; LCP < 2.5s on landing; lazy-load GSAP; transform/opacity-only animation.
23. **Definition of Done:** feature works end-to-end; relevant tests pass; no console errors; docs + .agent files updated; MUST items demonstrable in DEMO_SCRIPT.
