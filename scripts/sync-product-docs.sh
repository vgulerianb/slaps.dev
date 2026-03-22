#!/usr/bin/env bash
# Copy markdown from local agentpad (execpad) and stubfetch (ghost-env) clones into site-docs.
# Looks for ./execpad, ./ghost-env, or siblings ../execpad, ../ghost-env (see docRegistry).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
shopt -s nullglob
for pair in execpad ghost-env; do
  SRC=""
  if [[ -d "$ROOT/$pair/docs" ]]; then SRC="$ROOT/$pair/docs"
  elif [[ -d "$ROOT/../$pair/docs" ]]; then SRC="$ROOT/../$pair/docs"
  fi
  DST="$ROOT/src/site-docs/$pair"
  if [[ -n "$SRC" && -d "$SRC" ]]; then
    mkdir -p "$DST"
    # Skip docs/README.md — product index may only list slaps.dev URLs; site overview is README.md here.
    for f in "$SRC"/*.md; do
      [[ "$(basename "$f")" == README.md ]] && continue
      cp "$f" "$DST/"
    done
    echo "Synced $pair"
  else
    echo "Skip $pair (no docs dir — clone vgulerianb/$pair next to slaps.dev)"
  fi
done
