#!/usr/bin/env bash
# Copy markdown from local runmix / ghost-env repos into the site (when present).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for pair in runmix ghost-env; do
  SRC="$ROOT/$pair/docs"
  DST="$ROOT/src/site-docs/$pair"
  if [[ -d "$SRC" ]]; then
    mkdir -p "$DST"
    cp "$SRC"/*.md "$DST/"
    echo "Synced $pair"
  else
    echo "Skip $pair (no $SRC — clone repo or remove gitignore if needed)"
  fi
done
