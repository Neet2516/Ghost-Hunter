# Changelog — Ghost-Hunter

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Created `.agent/` directory with full persistent context files (`AGENT_RULES.md`, `PROJECT_CONTEXT.md`, `PRODUCT_CONTEXT.md`, `ARCHITECTURE_CONTEXT.md`, `IMPLEMENTATION_STATUS.md`, `DECISIONS.md`, `CONSTRAINTS.md`, `NEXT_TASKS.md`, `CONTEXT_MANAGEMENT.md`, `CHANGELOG.md`, `SESSION_LOG.md`, `HANDOFF.md`).
- Initialized pnpm monorepo with `packages/shared`, `apps/api`, `apps/worker`, and `apps/web` (TASK-001).
- Added `.env.example`, `.prettierrc`, `.gitignore`, `tsconfig.base.json`, and `pnpm-workspace.yaml`.
- Verified typechecking and production builds across all workspace packages.
