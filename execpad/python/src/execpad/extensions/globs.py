from __future__ import annotations

import fnmatch
from pathlib import Path


def _excluded(rel: str, exclude_globs: list[str]) -> bool:
    parts = rel.replace("\\", "/").split("/")
    if "node_modules" in parts or ".git" in parts:
        return True
    posix = rel.replace("\\", "/")
    return any(fnmatch.fnmatch(posix, g) for g in exclude_globs)


def list_matching_rel_paths(
    root: str | Path,
    include_globs: list[str],
    exclude_globs: list[str] | None = None,
) -> list[str]:
    exclude_globs = exclude_globs or []
    rootp = Path(root).resolve()
    rels: list[str] = []
    for p in rootp.rglob("*"):
        if not p.is_file():
            continue
        rel = str(p.relative_to(rootp)).replace("\\", "/")
        if _excluded(rel, exclude_globs):
            continue
        posix = rel
        if not include_globs:
            rels.append(rel)
            continue
        if any(fnmatch.fnmatch(posix, g) for g in include_globs):
            rels.append(rel)
    return rels
