#!/usr/bin/env bash
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
  echo "No agentpad/stubfetch clones found (see scripts/test-packages.sh)." >&2
  exit 1
fi

if [[ -n "$AGENTPAD" ]]; then
  echo "== agentpad (npm) @ $AGENTPAD =="
  (cd "$AGENTPAD" && npm test && npm run build)
  echo "== agentpad (python) =="
  PY="$AGENTPAD/python"
  if [[ ! -d "$PY/.venv" ]]; then (cd "$PY" && python3 -m venv .venv); fi
  # shellcheck source=/dev/null
  source "$PY/.venv/bin/activate"
  (cd "$PY" && pip install -e ".[dev]" -q)
  pytest -q "$PY/tests"
fi

if [[ -n "$STUBFETCH" ]]; then
  echo "== stubfetch (npm) @ $STUBFETCH =="
  (cd "$STUBFETCH" && npm test && npm run build)
  echo "== stubfetch (python) =="
  GPY="$STUBFETCH/python"
  if [[ ! -d "$GPY/.venv" ]]; then (cd "$GPY" && python3 -m venv .venv); fi
  # shellcheck source=/dev/null
  source "$GPY/.venv/bin/activate"
  (cd "$GPY" && pip install -e ".[dev]" -q)
  pytest -q "$GPY/tests"
fi

echo "e2e ok"
