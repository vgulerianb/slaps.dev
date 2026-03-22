#!/bin/zsh
# Publish agentpad and stubfetch from local clones (not committed in slaps.dev).
# Resolves: ./execpad or ../execpad, ./ghost-env or ../ghost-env.
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

if [[ -d "$ROOT/execpad" ]]; then AGENTPAD="$ROOT/execpad"
elif [[ -d "$ROOT/../execpad" ]]; then AGENTPAD="$ROOT/../execpad"
else fail "agentpad clone not found at $ROOT/execpad or $ROOT/../execpad"
fi

if [[ -d "$ROOT/ghost-env" ]]; then STUBFETCH="$ROOT/ghost-env"
elif [[ -d "$ROOT/../ghost-env" ]]; then STUBFETCH="$ROOT/../ghost-env"
else fail "stubfetch (ghost-env) clone not found at $ROOT/ghost-env or $ROOT/../ghost-env"
fi

# ── npm: agentpad ─────────────────────────────────────────────────────────────

log "Building agentpad (npm) @ $AGENTPAD…"
cd "$AGENTPAD"
npm install --silent
npm run build
ok "agentpad built — $(ls dist/ | wc -l | xargs) files in dist/"

log "Publishing agentpad to npm…"
npm publish --access public
ok "agentpad published to npm ✓"

# ── npm: stubfetch (ghost-env/) ─────────────────────────────────────────────

log "Building stubfetch (npm) @ $STUBFETCH…"
cd "$STUBFETCH"
npm install --silent
npm run build
ok "stubfetch built — $(ls dist/ | wc -l | xargs) files in dist/"

log "Publishing stubfetch to npm…"
npm publish --access public
ok "stubfetch published to npm ✓"

# ── PyPI: agentpad ────────────────────────────────────────────────────────────

log "Building agentpad (PyPI)…"
cd "$AGENTPAD/python"
rm -rf dist
hatch build
ok "agentpad wheel + sdist built: $(ls dist/)"

log "Publishing agentpad to PyPI…"
hatch publish
ok "agentpad published to PyPI ✓"

# ── PyPI: stubfetch ──────────────────────────────────────────────────────────

log "Building stubfetch (PyPI)…"
cd "$STUBFETCH/python"
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
