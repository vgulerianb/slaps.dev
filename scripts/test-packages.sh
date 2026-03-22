#!/usr/bin/env bash
# Run automated tests for execpad and ghost-env (Node + Python).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "== execpad (Node / Vitest) =="
(cd "$ROOT/execpad" && npm test)

echo "== execpad (Python / pytest) =="
EPY="$ROOT/execpad/python"
if [[ ! -d "$EPY/.venv" ]]; then (cd "$EPY" && python3 -m venv .venv); fi
# shellcheck source=/dev/null
source "$EPY/.venv/bin/activate"
(cd "$EPY" && pip install -e ".[dev]" -q)
pytest -q "$EPY/tests"

echo "== ghost-env (Node / Vitest) =="
(cd "$ROOT/ghost-env" && npm test)

echo "== ghost-env (Python / pytest) =="
GPY="$ROOT/ghost-env/python"
if [[ ! -d "$GPY/.venv" ]]; then (cd "$GPY" && python3 -m venv .venv); fi
# shellcheck source=/dev/null
source "$GPY/.venv/bin/activate"
(cd "$GPY" && pip install -e ".[dev]" -q)
pytest -q "$GPY/tests"

echo "All package tests passed."
