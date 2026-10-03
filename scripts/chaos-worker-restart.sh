#!/usr/bin/env bash
set -euo pipefail

# Ghost-Hunter — Scenario #5: Worker Kill & Restart Chaos Test
# Kills a running worker abruptly via SIGKILL mid-wait, verifies Temporal server preserves state,
# restarts worker, and verifies workflow completes with zero state loss.

echo "👻 Starting Scenario #5: Worker Kill & Restart Chaos Test..."
export PATH="/home/kailler/.local/bin:$PATH"

pnpm chaos:worker
