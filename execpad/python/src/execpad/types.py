from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal, Optional

Language = Literal["bash", "python", "javascript", "sql"]


@dataclass
class FileChange:
    path: str
    type: Literal["created", "modified", "deleted"]
    size: int


@dataclass
class RunResult:
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: float
    files: list[FileChange] = field(default_factory=list)
    truncated: bool = False


@dataclass
class RunLogEntry:
    id: str
    at: float
    language: Language
    code: str
    cwd: str
    exit_code: int
    duration_ms: float
    stdout: str
    stderr: str
    truncated: bool
    files: list[FileChange]


@dataclass
class SerializedRuntime:
    version: int
    root: str
    readonly: bool
    overlay: bool
    overlay_writes: dict[str, str]
