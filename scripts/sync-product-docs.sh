#!/usr/bin/env bash
# Copy markdown from local agentpad / stubfetch clones into src/site-docs/
# (on-disk folders execpad/ and ghost-env/ match docRegistry DOC_SITE_FS_DIR).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
shopt -s nullglob

pick_docs_src() {
  local name
  for name in "$@"; do
    [[ -d "$ROOT/$name/docs" ]] && { echo "$ROOT/$name/docs"; return 0; }
    [[ -d "$ROOT/../$name/docs" ]] && { echo "$ROOT/../$name/docs"; return 0; }
  done
  return 1
}

sync_docs() {
  local dst_rel="$1"
  local repo_url="$2"
  shift 2
  local SRC
  SRC="$(pick_docs_src "$@" || true)"
  local DST="$ROOT/src/site-docs/$dst_rel"
  if [[ -n "$SRC" && -d "$SRC" ]]; then
    mkdir -p "$DST"
    # Skip docs/README.md — site overview is README.md here.
    local f
    for f in "$SRC"/*.md; do
      [[ "$(basename "$f")" == README.md ]] && continue
      cp "$f" "$DST/"
    done
    echo "Synced $dst_rel ← $SRC"
  else
    echo "Skip $dst_rel (no docs/ — clone $repo_url next to slaps.dev)"
  fi
}

sync_docs execpad "https://github.com/vgulerianb/agentpad" agentpad execpad
sync_docs ghost-env "https://github.com/vgulerianb/stubfetch" stubfetch ghost-env
