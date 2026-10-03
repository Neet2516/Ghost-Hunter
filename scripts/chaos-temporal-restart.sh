#!/usr/bin/env bash
set -euo pipefail

# Ghost-Hunter — Scenario #6: Temporal Server Blip & Resilience Chaos Test
# Tests connection resilience and task draining across server restarts and worker reconnections.

echo "👻 Starting Scenario #6: Temporal Server Resilience Chaos Test..."
export PATH="/home/kailler/.local/bin:$PATH"

pnpm chaos:temporal
