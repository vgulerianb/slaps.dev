#!/usr/bin/env bash
# Run automated tests for agentpad (execpad repo) and stubfetch (ghost-env repo), Node + Python.
# Expects clones at ./execpad, ./ghost-env, or sibling ../execpad, ../ghost-env.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pick_dir() {
  local d
  for d in "$@"; do
    [[ -d "$d" ]] || continue
    echo "$d"
    return 0
  done
  return 1
}

AGENTPAD="$(pick_dir "$ROOT/execpad" "$ROOT/../execpad" || true)"
STUBFETCH="$(pick_dir "$ROOT/ghost-env" "$ROOT/../ghost-env" || true)"

if [[ -z "$AGENTPAD" && -z "$STUBFETCH" ]]; then
  echo "No package repos found. Clone next to slaps.dev:" >&2
  echo "  git clone https://github.com/vgulerianb/execpad.git" >&2
  echo "  git clone https://github.com/vgulerianb/ghost-env.git" >&2
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
  echo "== agentpad: skip (no execpad clone at $ROOT/execpad or $ROOT/../execpad) =="
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
  echo "== stubfetch: skip (no ghost-env clone at $ROOT/ghost-env or $ROOT/../ghost-env) =="
fi

echo "All available package tests passed."
