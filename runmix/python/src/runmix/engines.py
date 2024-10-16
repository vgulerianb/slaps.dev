from __future__ import annotations

import shutil
import subprocess
import sys
import time
from pathlib import Path

from runmix.types import RunResult


def _truncate(stdout: str, stderr: str, max_bytes: int | None) -> tuple[str, str, bool]:
    if max_bytes is None or max_bytes <= 0:
        return stdout, stderr, False
    if len(stdout) + len(stderr) <= max_bytes:
        return stdout, stderr, False
    budget = max_bytes
    if len(stdout) > budget:
        return stdout[:budget] + "\n...[truncated]", "", True
    budget -= len(stdout)
    err = stderr[:budget] + "\n...[truncated]" if len(stderr) > budget else stderr
    return stdout, err, True


def run_subprocess(
    argv: list[str],
    cwd: str,
    env: dict[str, str] | None,
    timeout_s: float,
    max_output_bytes: int | None,
) -> RunResult:
    start = time.perf_counter()
    try:
        p = subprocess.run(
            argv,
            cwd=cwd,
            env={**__import__("os").environ, **(env or {})},
            capture_output=True,
            text=True,
            timeout=timeout_s,
        )
        out, err, trunc = _truncate(p.stdout or "", p.stderr or "", max_output_bytes)
        return RunResult(
            stdout=out,
            stderr=err,
            exit_code=p.returncode,
            duration_ms=(time.perf_counter() - start) * 1000,
            files=[],
            truncated=trunc,
        )
    except subprocess.TimeoutExpired as e:
        out, err, trunc = _truncate(
            (e.stdout or "") if isinstance(e.stdout, str) else "",
            (e.stderr or "") if isinstance(e.stderr, str) else "",
            max_output_bytes,
        )
        return RunResult(
            stdout=out,
            stderr=err or "timeout",
            exit_code=124,
            duration_ms=(time.perf_counter() - start) * 1000,
            files=[],
            truncated=trunc,
        )
    except FileNotFoundError as e:
        return RunResult(
            stdout="",
            stderr=str(e),
            exit_code=127,
            duration_ms=(time.perf_counter() - start) * 1000,
            files=[],
            truncated=False,
        )


def run_bash(code: str, cwd: str, env: dict[str, str] | None, timeout_s: float, max_out: int | None) -> RunResult:
    bash = shutil.which("bash") or "bash"
    return run_subprocess([bash, "-c", code], cwd, env, timeout_s, max_out)


def run_python(code: str, cwd: str, env: dict[str, str] | None, timeout_s: float, max_out: int | None) -> RunResult:
    py = shutil.which("python3") or shutil.which("python") or "python3"
    return run_subprocess([py, "-c", code], cwd, env, timeout_s, max_out)


def run_javascript(code: str, cwd: str, env: dict[str, str] | None, timeout_s: float, max_out: int | None) -> RunResult:
    node = shutil.which("node") or "node"
    return run_subprocess([node, "-e", code], cwd, env, timeout_s, max_out)


def run_sql(code: str, cwd: str, env: dict[str, str] | None, timeout_s: float, max_out: int | None) -> RunResult:
    import sqlite3

    _ = cwd, env, timeout_s  # SQL runs in-memory; cwd reserved for attach extensions
    start = time.perf_counter()
    try:
        con = sqlite3.connect(":memory:")
        cur = con.cursor()
        parts = [s.strip() for s in code.split(";") if s.strip()]
        out_lines: list[str] = []
        for stmt in parts:
            cur.execute(stmt)
            if cur.description:
                rows = cur.fetchall()
                out_lines.extend(str(r) for r in rows)
            else:
                con.commit()
        con.close()
        out = "\n".join(out_lines) + ("\n" if out_lines else "")
        out, err, trunc = _truncate(out, "", max_out)
        return RunResult(
            stdout=out,
            stderr=err,
            exit_code=0,
            duration_ms=(time.perf_counter() - start) * 1000,
            files=[],
            truncated=trunc,
        )
    except Exception as e:  # noqa: BLE001
        return RunResult(
            stdout="",
            stderr=str(e),
            exit_code=1,
            duration_ms=(time.perf_counter() - start) * 1000,
            files=[],
            truncated=False,
        )
