#!/usr/bin/env bash
# Copy markdown from local execpad / ghost-env repos into the site (when present).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
shopt -s nullglob
for pair in execpad ghost-env; do
  SRC="$ROOT/$pair/docs"
  DST="$ROOT/src/site-docs/$pair"
  if [[ -d "$SRC" ]]; then
    mkdir -p "$DST"
    # Skip docs/README.md — product index may only list slaps.dev URLs; site overview is README.md here.
    for f in "$SRC"/*.md; do
      [[ "$(basename "$f")" == README.md ]] && continue
      cp "$f" "$DST/"
    done
    echo "Synced $pair"
  else
    echo "Skip $pair (no $SRC — clone repo or remove gitignore if needed)"
  fi
done
