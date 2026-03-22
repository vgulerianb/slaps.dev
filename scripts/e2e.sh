#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "== execpad (npm) =="
(cd "$ROOT/execpad" && npm test && npm run build)

echo "== execpad (python) =="
PY="$ROOT/execpad/python"
if [[ ! -d "$PY/.venv" ]]; then (cd "$PY" && python3 -m venv .venv); fi
# shellcheck source=/dev/null
source "$PY/.venv/bin/activate"
pip install -e "$PY[dev]" -q
pytest -q "$PY/tests"

echo "== ghost-env (npm) =="
(cd "$ROOT/ghost-env" && npm test && npm run build)

echo "== ghost-env (python) =="
GPY="$ROOT/ghost-env/python"
if [[ ! -d "$GPY/.venv" ]]; then (cd "$GPY" && python3 -m venv .venv); fi
# shellcheck source=/dev/null
source "$GPY/.venv/bin/activate"
pip install -e "$GPY[dev]" -q
pytest -q "$GPY/tests"

echo "e2e ok"
