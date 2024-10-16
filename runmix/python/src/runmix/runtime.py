from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path
from typing import Any

from runmix.engines import run_bash, run_javascript, run_python, run_sql
from runmix.extensions.globs import list_matching_rel_paths
from runmix.types import FileChange, Language, RunResult, SerializedRuntime


def _cp_tree(src: Path, dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest, dirs_exist_ok=True)


def _merge_overlay_to_root(work: Path, root: Path) -> None:
    for p in work.rglob("*"):
        if p.is_file():
            rel = p.relative_to(work)
            out = root / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, out)


def _snapshot_tree(root: Path, rels: list[str]) -> dict[str, tuple[float, int]]:
    m: dict[str, tuple[float, int]] = {}
    for rel in rels:
        p = root / rel
        if p.is_file():
            st = p.stat()
            m[rel] = (st.st_mtime, st.st_size)
    return m


def _diff_tree(root: Path, before: dict[str, tuple[float, int]], rels: list[str]) -> list[FileChange]:
    changes: list[FileChange] = []
    for rel in rels:
        p = root / rel
        if not p.is_file():
            if rel in before:
                changes.append(FileChange(path=rel, type="deleted", size=0))
            continue
        st = p.stat()
        prev = before.get(rel)
        if prev is None:
            changes.append(FileChange(path=rel, type="created", size=st.st_size))
        elif prev[0] != st.st_mtime or prev[1] != st.st_size:
            changes.append(FileChange(path=rel, type="modified", size=st.st_size))
    return changes


class Runtime:
    def __init__(
        self,
        root: str | Path,
        *,
        readonly: bool = False,
        overlay: bool = False,
        limits: dict[str, Any] | None = None,
        files: dict[str, str] | None = None,
        include_globs: list[str] | None = None,
        exclude_globs: list[str] | None = None,
    ) -> None:
        self.root = Path(root).resolve()
        self._readonly = readonly
        self._overlay = overlay
        self._limits = limits or {}
        self._include = include_globs
        self._exclude = exclude_globs or ["**/node_modules/**", "**/.git/**"]
        self._owns_workdir = overlay
        if overlay:
            self._workdir = Path(tempfile.mkdtemp(prefix="runmix-"))
            _cp_tree(self.root, self._workdir)
        else:
            self._workdir = self.root
        if files:
            for rel, content in files.items():
                p = self._workdir / rel
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(content, encoding="utf8")

    @property
    def effective_root(self) -> Path:
        return self._workdir

    def _timeout_s(self) -> float:
        return float(self._limits.get("timeout_ms", 30_000)) / 1000.0

    def _max_out(self) -> int | None:
        return self._limits.get("max_output_bytes")

    def _glob_scope(self) -> list[str]:
        inc = self._include or ["**/*"]
        return list_matching_rel_paths(self._workdir, inc, self._exclude)

    def run(
        self,
        language: Language,
        code: str,
        *,
        cwd: str | None = None,
        env: dict[str, str] | None = None,
    ) -> RunResult:
        wd = (self._workdir / (cwd or ".")).resolve()
        if not str(wd).startswith(str(self._workdir.resolve())):
            raise ValueError("cwd escapes workspace")
        timeout_s = self._timeout_s()
        max_out = self._max_out()
        before = _snapshot_tree(self._workdir, self._glob_scope())
        if language == "bash":
            r = run_bash(code, str(wd), env, timeout_s, max_out)
        elif language == "python":
            r = run_python(code, str(wd), env, timeout_s, max_out)
        elif language == "javascript":
            r = run_javascript(code, str(wd), env, timeout_s, max_out)
        elif language == "sql":
            r = run_sql(code, str(wd), env, timeout_s, max_out)
        else:
            raise ValueError(f"Unknown language: {language}")
        after_rels = list_matching_rel_paths(self._workdir, ["**/*"], self._exclude)
        r.files = _diff_tree(self._workdir, before, after_rels)
        return r

    def apply(self) -> None:
        if not self._overlay:
            raise RuntimeError("apply() only valid in overlay mode")
        _merge_overlay_to_root(self._workdir, self.root)

    def close(self) -> None:
        if self._owns_workdir and self._workdir.exists():
            shutil.rmtree(self._workdir, ignore_errors=True)

    def serialize(self) -> SerializedRuntime:
        writes: dict[str, str] = {}
        if self._overlay:
            for p in self._workdir.rglob("*"):
                if p.is_file():
                    rel = str(p.relative_to(self._workdir)).replace("\\", "/")
                    writes[rel] = p.read_text(encoding="utf8", errors="replace")
        return SerializedRuntime(
            version=1,
            root=str(self.root),
            readonly=self._readonly,
            overlay=self._overlay,
            overlay_writes=writes,
        )

    @staticmethod
    def deserialize(data: SerializedRuntime) -> Runtime:
        if data.version != 1:
            raise ValueError("Unsupported version")
        return Runtime(
            data.root,
            overlay=data.overlay,
            readonly=data.readonly,
            files=data.overlay_writes if data.overlay and data.overlay_writes else None,
        )

    def fs_write(self, rel: str, content: str) -> None:
        if self._readonly:
            raise OSError("read-only")
        p = self._workdir / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf8")

    def fs_read(self, rel: str) -> str:
        return (self._workdir / rel).read_text(encoding="utf8")

    def as_openai_tool(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": "execute_code",
                "description": "Execute code in workspace (bash, python, javascript, sql).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "language": {
                            "type": "string",
                            "enum": ["bash", "python", "javascript", "sql"],
                        },
                        "code": {"type": "string"},
                    },
                    "required": ["language", "code"],
                },
            },
        }

    def execute_tool_call(self, args: dict[str, Any]) -> RunResult:
        return self.run(args["language"], args["code"])
