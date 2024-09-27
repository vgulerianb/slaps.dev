from __future__ import annotations

from typing import Any, Optional

import httpx

from sandcastle.errors import SandcastleError
from sandcastle.types import ExecResources, ExecResult


class Sandbox:
    def __init__(self, client: httpx.AsyncClient, base: str, sandbox_id: str, api_key: str):
        self._client = client
        self._base = base.rstrip("/")
        self.id = sandbox_id
        self._api_key = api_key

    def _headers(self) -> dict[str, str]:
        h = {"Content-Type": "application/json"}
        if self._api_key:
            h["Authorization"] = f"Bearer {self._api_key}"
        return h

    async def exec(self, command: str, timeout_secs: Optional[int] = None) -> ExecResult:
        body: dict = {"command": command}
        if timeout_secs is not None:
            body["timeoutSecs"] = timeout_secs
        r = await self._client.post(
            f"{self._base}/v1/sandboxes/{self.id}/exec",
            headers=self._headers(),
            json=body,
        )
        data = r.json() if r.content else {}
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        res = data.get("resources") or {}
        return ExecResult(
            stdout=data.get("stdout", ""),
            stderr=data.get("stderr", ""),
            exit_code=int(data.get("exitCode", -1)),
            resources=ExecResources(
                memory_peak_mb=int(res.get("memoryPeakMb", 0)),
                cpu_time_ms=int(res.get("cpuTimeMs", 0)),
                wall_time_ms=int(res.get("wallTimeMs", 0)),
                disk_used_mb=int(res.get("diskUsedMb", 0)),
            ),
        )

    async def write_file(self, path: str, content: str | bytes) -> None:
        p = path.lstrip("/")
        r = await self._client.put(
            f"{self._base}/v1/sandboxes/{self.id}/files/{p}",
            headers=self._headers(),
            content=content if isinstance(content, bytes) else content.encode(),
        )
        if r.is_error:
            d = r.json() if r.content else {}
            raise SandcastleError(d.get("error", r.text), r.status_code, d)

    async def read_file(self, path: str) -> str:
        p = path.lstrip("/")
        r = await self._client.get(
            f"{self._base}/v1/sandboxes/{self.id}/files/{p}",
            headers=self._headers(),
        )
        if r.is_error:
            d = r.json() if r.content else {}
            raise SandcastleError(d.get("error", r.text), r.status_code, d)
        return r.text

    async def list_files(self, path: str = "") -> list[dict[str, Any]]:
        q = f"?path={path}" if path else ""
        r = await self._client.get(
            f"{self._base}/v1/sandboxes/{self.id}/files{q}",
            headers=self._headers(),
        )
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        return data

    async def usage(self) -> dict[str, Any]:
        r = await self._client.get(
            f"{self._base}/v1/sandboxes/{self.id}/usage",
            headers=self._headers(),
        )
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        return data

    async def snapshot(self, label: str | None = None) -> dict[str, Any]:
        r = await self._client.post(
            f"{self._base}/v1/sandboxes/{self.id}/snapshot",
            headers=self._headers(),
            json={"label": label} if label else {},
        )
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        return data

    async def replay(self) -> list[dict[str, Any]]:
        r = await self._client.get(
            f"{self._base}/v1/sandboxes/{self.id}/replay",
            headers=self._headers(),
        )
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        return data

    async def destroy(self) -> None:
        r = await self._client.delete(
            f"{self._base}/v1/sandboxes/{self.id}",
            headers=self._headers(),
        )
        if r.is_error:
            d = r.json() if r.content else {}
            raise SandcastleError(d.get("error", r.text), r.status_code, d)
