# Context Management — Ghost-Hunter

## Protocol for Agent Sessions
1. **At Session Start:**
   - Read `AGENTS.md` and `.agent/AGENT_RULES.md`.
   - Read `.agent/PROJECT_CONTEXT.md`, `.agent/ARCHITECTURE_CONTEXT.md`, `.agent/IMPLEMENTATION_STATUS.md`, and `.agent/NEXT_TASKS.md`.
   - Inspect the codebase to verify ground truth before modifying anything.

2. **During Implementation:**
   - Strictly adhere to the current task in `docs/ANTIGRAVITY_TASKS.md`.
   - Respect constraints in `.agent/CONSTRAINTS.md` and decisions in `.agent/DECISIONS.md`.
   - Validate with commands like `pnpm -r typecheck` or relevant test suites.

3. **At Session End:**
   - Update `.agent/IMPLEMENTATION_STATUS.md` with verified results.
   - Update `.agent/NEXT_TASKS.md` with updated priorities.
   - Append session summary to `.agent/SESSION_LOG.md`.
   - Update `.agent/CHANGELOG.md` if user-facing or architectural changes occurred.
   - Update `.agent/HANDOFF.md` with instructions for the next agent.
   - Commit changes cleanly to git.
