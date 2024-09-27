from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Optional


@dataclass
class ExecResources:
    memory_peak_mb: int = 0
    cpu_time_ms: int = 0
    wall_time_ms: int = 0
    disk_used_mb: int = 0


@dataclass
class ExecResult:
    stdout: str
    stderr: str
    exit_code: int
    resources: ExecResources


@dataclass
class CreateOptions:
    size: Optional[str] = None
    packages: Optional[dict[str, Any]] = None
    env: Optional[dict[str, str]] = None
    queue: Optional[dict[str, Any]] = None
    tenant_id: Optional[str] = None
    from_snapshot: Optional[str] = None
    on_queue_status: Optional[Callable[[dict], None]] = None

