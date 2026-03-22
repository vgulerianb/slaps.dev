from __future__ import annotations

import tempfile
from pathlib import Path

from agentpad import Runtime, export_run_log_json


def test_bash_cat(tmp_path: Path) -> None:
    (tmp_path / "a.txt").write_text("hi", encoding="utf8")
    rt = Runtime(tmp_path)
    r = rt.run("bash", "cat a.txt")
    assert r.exit_code == 0
    assert r.stdout.strip() == "hi"
    rt.close()


def test_python_print(tmp_path: Path) -> None:
    rt = Runtime(tmp_path)
    r = rt.run("python", "print(2+2)")
    assert r.exit_code == 0
    assert r.stdout.strip() == "4"
    rt.close()


def test_overlay_apply(tmp_path: Path) -> None:
    (tmp_path / "x").mkdir()
    (tmp_path / "x" / "f.txt").write_text("a", encoding="utf8")
    rt = Runtime(tmp_path, overlay=True)
    r = rt.run("bash", 'echo "b" > x/f.txt')
    assert r.exit_code == 0
    assert (tmp_path / "x" / "f.txt").read_text(encoding="utf8").strip() == "a"
    rt.apply()
    assert (tmp_path / "x" / "f.txt").read_text(encoding="utf8").strip() == "b"
    rt.close()


def test_sql_select() -> None:
    rt = Runtime(tempfile.mkdtemp())
    r = rt.run("sql", "SELECT 1 AS n;")
    assert r.exit_code == 0
    assert "1" in r.stdout
    rt.close()


def test_run_log_ring_and_clear(tmp_path: Path) -> None:
    seen: list[str] = []
    rt = Runtime(tmp_path, run_log_max_entries=2, on_run=lambda e: seen.append(e.id))
    rt.run("bash", "echo 1")
    rt.run("bash", "echo 2")
    rt.run("bash", "echo 3")
    log = rt.get_run_log()
    assert len(log) == 2
    assert log[0].stdout.strip() == "2"
    assert log[1].stdout.strip() == "3"
    assert len(seen) == 3
    assert "run-3" in export_run_log_json(log)
    rt.clear_run_log()
    assert rt.get_run_log() == []
    rt.close()


def test_run_log_disabled(tmp_path: Path) -> None:
    rt = Runtime(tmp_path, run_log=False)
    rt.run("bash", "echo x")
    assert rt.get_run_log() == []
    rt.close()
