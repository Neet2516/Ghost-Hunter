# Intended File Structure
```
/
├── .agent/
├── docs/
├── apps/
│   ├── web/            (Next.js: app/, components/, hooks/, lib/, styles/, public/)
│   ├── api/            (Fastify: routes/, services/, db/, temporal-client/, sse/)
│   └── worker/         (workflows/, activities/, ollama/, worker.ts)
├── packages/shared/    (zod schemas, enums, types, constants)
├── tests/              (e2e/, chaos/, fixtures/)
├── scripts/            (dev, seed, chaos helpers)
├── docker-compose.yml
├── .env.example
├── AGENTS.md
├── CLAUDE.md
└── README.md
```
Rule: workflows folder imports only from `@temporalio/workflow` and shared types (determinism).
