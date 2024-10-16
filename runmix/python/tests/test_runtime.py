from __future__ import annotations

import tempfile
from pathlib import Path

from runmix import Runtime


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
