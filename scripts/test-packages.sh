#!/usr/bin/env bash
# Run automated tests for agentpad and stubfetch (Node + Python).
# Resolves clones: agentpad or execpad, stubfetch or ghost-env (./ or ../).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pick_clone() {
  local name
  for name in "$@"; do
    [[ -d "$ROOT/$name" ]] && { echo "$ROOT/$name"; return 0; }
    [[ -d "$ROOT/../$name" ]] && { echo "$ROOT/../$name"; return 0; }
  done
  return 1
}

AGENTPAD="$(pick_clone agentpad execpad || true)"
STUBFETCH="$(pick_clone stubfetch ghost-env || true)"

if [[ -z "$AGENTPAD" && -z "$STUBFETCH" ]]; then
  echo "No package repos found. Clone next to slaps.dev:" >&2
  echo "  git clone https://github.com/vgulerianb/agentpad.git" >&2
  echo "  git clone https://github.com/vgulerianb/stubfetch.git" >&2
  exit 1
fi

if [[ -n "$AGENTPAD" ]]; then
  echo "== agentpad (Node / Vitest) @ $AGENTPAD =="
  (cd "$AGENTPAD" && npm test)
  echo "== agentpad (Python / pytest) =="
  EPY="$AGENTPAD/python"
  if [[ ! -d "$EPY/.venv" ]]; then (cd "$EPY" && python3 -m venv .venv); fi
  # shellcheck source=/dev/null
  source "$EPY/.venv/bin/activate"
  (cd "$EPY" && pip install -e ".[dev]" -q)
  pytest -q "$EPY/tests"
else
  echo "== agentpad: skip (no clone named agentpad/ or execpad/ next to slaps.dev) =="
fi

if [[ -n "$STUBFETCH" ]]; then
  echo "== stubfetch (Node / Vitest) @ $STUBFETCH =="
  (cd "$STUBFETCH" && npm test)
  echo "== stubfetch (Python / pytest) =="
  GPY="$STUBFETCH/python"
  if [[ ! -d "$GPY/.venv" ]]; then (cd "$GPY" && python3 -m venv .venv); fi
  # shellcheck source=/dev/null
  source "$GPY/.venv/bin/activate"
  (cd "$GPY" && pip install -e ".[dev]" -q)
  pytest -q "$GPY/tests"
else
  echo "== stubfetch: skip (no clone named stubfetch/ or ghost-env/ next to slaps.dev) =="
fi

echo "All available package tests passed."
