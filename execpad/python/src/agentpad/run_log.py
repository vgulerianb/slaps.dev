from __future__ import annotations

import json
from datetime import datetime, timezone

from agentpad.types import RunLogEntry


def export_run_log_json(entries: list[RunLogEntry], *, pretty: bool = True) -> str:
    payload = [
        {
            "id": e.id,
            "at": e.at,
            "language": e.language,
            "code": e.code,
            "cwd": e.cwd,
            "exitCode": e.exit_code,
            "durationMs": e.duration_ms,
            "stdout": e.stdout,
            "stderr": e.stderr,
            "truncated": e.truncated,
            "files": [{"path": f.path, "type": f.type, "size": f.size} for f in e.files],
        }
        for e in entries
    ]
    return json.dumps(payload, indent=2 if pretty else None)


def export_run_log_markdown(entries: list[RunLogEntry]) -> str:
    lines: list[str] = ["# agentpad session log", ""]
    for e in entries:
        ts = datetime.fromtimestamp(e.at / 1000, tz=timezone.utc).isoformat()
        lines.append(f"## {e.id} — {e.language} @ {ts}")
        lines.append("")
        lines.append(
            f"- **exit:** {e.exit_code} · **duration:** {e.duration_ms}ms · **truncated:** {e.truncated}"
        )
        lines.append(f"- **cwd:** `{e.cwd}`")
        if e.files:
            parts = [f"{f.type}:{f.path}" for f in e.files]
            lines.append(f"- **files:** {', '.join(parts)}")
        lines.extend(["", "### code", "", "```", e.code, "```", "", "### stdout", "", "```", e.stdout or "(empty)", "```"])
        lines.extend(["", "### stderr", "", "```", e.stderr or "(empty)", "```", ""])
    return "\n".join(lines)
