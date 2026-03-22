#!/bin/zsh
# Publish agentpad and stubfetch (monorepo dirs execpad/, ghost-env/) to npm and PyPI.
# Usage:
#   export HATCH_INDEX_USER=__token__
#   export HATCH_INDEX_AUTH=pypi-<your-token>
#   bash scripts/publish.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

RED='\033[0;31m'
GRN='\033[0;32m'
BLU='\033[0;34m'
YLW='\033[0;33m'
NC='\033[0m'

log()  { echo -e "${BLU}▶ $*${NC}"; }
ok()   { echo -e "${GRN}✔ $*${NC}"; }
warn() { echo -e "${YLW}⚠ $*${NC}"; }
fail() { echo -e "${RED}✘ $*${NC}"; exit 1; }

# ── Preflight ────────────────────────────────────────────────────────────────

log "Checking npm login…"
NPM_USER="$(npm whoami 2>/dev/null)" || fail "Not logged into npm. Run: npm login"
ok "npm user: $NPM_USER"

if [[ -z "${HATCH_INDEX_AUTH:-}" ]]; then
  warn "HATCH_INDEX_AUTH not set — hatch publish will prompt for PyPI credentials."
  warn "To skip the prompt: export HATCH_INDEX_USER=__token__ && export HATCH_INDEX_AUTH=pypi-<your-token>"
fi

which hatch &>/dev/null || { log "Installing hatch…"; pip3 install --quiet hatch; }

# ── npm: agentpad (execpad/) ─────────────────────────────────────────────────

log "Building agentpad (npm, execpad/)…"
cd "$ROOT/execpad"
npm install --silent
npm run build
ok "agentpad built — $(ls dist/ | wc -l | xargs) files in dist/"

log "Publishing agentpad to npm…"
npm publish --access public
ok "agentpad published to npm ✓"

# ── npm: stubfetch (ghost-env/) ─────────────────────────────────────────────

log "Building stubfetch (npm, ghost-env/)…"
cd "$ROOT/ghost-env"
npm install --silent
npm run build
ok "stubfetch built — $(ls dist/ | wc -l | xargs) files in dist/"

log "Publishing stubfetch to npm…"
npm publish --access public
ok "stubfetch published to npm ✓"

# ── PyPI: agentpad ────────────────────────────────────────────────────────────

log "Building agentpad (PyPI)…"
cd "$ROOT/execpad/python"
rm -rf dist
hatch build
ok "agentpad wheel + sdist built: $(ls dist/)"

log "Publishing agentpad to PyPI…"
hatch publish
ok "agentpad published to PyPI ✓"

# ── PyPI: stubfetch ──────────────────────────────────────────────────────────

log "Building stubfetch (PyPI)…"
cd "$ROOT/ghost-env/python"
rm -rf dist
hatch build
ok "stubfetch wheel + sdist built: $(ls dist/)"

log "Publishing stubfetch to PyPI…"
hatch publish
ok "stubfetch published to PyPI ✓"

# ── Done ─────────────────────────────────────────────────────────────────────

echo ""
ok "All four packages published!"
echo ""
echo "  npm  → https://www.npmjs.com/package/agentpad"
echo "  npm  → https://www.npmjs.com/package/stubfetch"
echo "  PyPI → https://pypi.org/project/agentpad/"
echo "  PyPI → https://pypi.org/project/stubfetch/"
