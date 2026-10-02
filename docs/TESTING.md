# Testing Strategy
Tools: Vitest (unit/integration), `@temporalio/testing` TestWorkflowEnvironment with time-skipping (workflow tests), local stub server for Ollama, Playwright (UI), manual chaos script for restarts.
Layers: unit (validators, prompt builder, state mappers) · activity (mock Ollama/DB) · workflow (time-skipping) · API (inject) · UI (Playwright happy path + degraded) · AI validation (fixture set of good/bad JSON).
| # | Scenario | Method | Pass criteria |
|---|---|---|---|
| 1 | Workflow creation | API integration | One workflow `gh-id`; status HUNTING |
| 2 | Durable wait | time-skip | No draft before delay; fires after |
| 3 | Reply signal | workflow test | Ends REPLIED, no activity call |
| 4 | Cancellation | workflow test | CANCELLED, pending draft discarded |
| 5 | Worker restart | manual/chaos | Kill worker mid-wait; restart; timer still fires once |
| 6 | Temporal restart | manual/chaos | Restart server (persistent DB); workflow resumes |
| 7 | Ollama unavailable | stub down | Retries, DEGRADED, template offered |
| 8 | Gemma missing | stub 404 model | Same as 7 + clear model-status error |
| 9 | Malformed AI JSON | fixtures | Retry then fallback; never shown raw |
| 10 | Activity retry | stub fails 2× then OK | Success on 3rd; RETRY events recorded |
| 11 | Notification failure | mock fail | Non-fatal; logged; workflow continues |
| 12 | Duplicate workflow | API ×2 | Second rejected 409 |
| 13 | Invalid input | API/UI | 400 with field errors |
| 14 | Reply just before timer | workflow test: send signal at delay−ε, and during GENERATING | REPLIED wins; draft DISCARDED_REPLY; no notification |
