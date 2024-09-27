from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Optional

import httpx

from sandcastle.errors import SandcastleError
from sandcastle.sandbox import Sandbox
from sandcastle.types import CreateOptions


class Sandcastle:
    def __init__(
        self,
        api_key: str = "",
        base_url: str = "http://127.0.0.1:8787",
        timeout: float = 120.0,
    ):
        self._api_key = api_key
        self._base = base_url.rstrip("/")
        self._client = httpx.AsyncClient(timeout=timeout)

    def _headers(self) -> dict[str, str]:
        h = {"Content-Type": "application/json"}
        if self._api_key:
            h["Authorization"] = f"Bearer {self._api_key}"
        return h

    def _to_body(self, opts: CreateOptions) -> dict[str, Any]:
        body: dict[str, Any] = {}
        if opts.size:
            body["size"] = opts.size
        if opts.packages:
            body["packages"] = opts.packages
        if opts.env:
            body["env"] = opts.env
        if opts.queue:
            body["queue"] = opts.queue
        if opts.tenant_id:
            body["tenantId"] = opts.tenant_id
        if opts.from_snapshot:
            body["fromSnapshot"] = opts.from_snapshot
        return body

    @asynccontextmanager
    async def session(self, opts: Optional[CreateOptions] = None) -> AsyncIterator[Sandbox]:
        sb = await self.create(opts)
        try:
            yield sb
        finally:
            await sb.destroy()

    async def create(self, opts: Optional[CreateOptions] = None) -> Sandbox:
        o = opts or CreateOptions()
        if o.on_queue_status:
            o.on_queue_status({"state": "provisioning"})
        r = await self._client.post(
            f"{self._base}/v1/sandboxes",
            headers=self._headers(),
            json=self._to_body(o),
        )
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        if o.on_queue_status:
            o.on_queue_status({"state": "ready"})
        sid = data["id"]
        return Sandbox(self._client, self._base, sid, self._api_key)

    async def fork(self, snapshot_id: str) -> Sandbox:
        r = await self._client.post(
            f"{self._base}/v1/sandboxes/from-snapshot",
            headers=self._headers(),
            json={"snapshotId": snapshot_id},
        )
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        return Sandbox(self._client, self._base, data["id"], self._api_key)

    async def status(self) -> dict[str, Any]:
        r = await self._client.get(f"{self._base}/v1/status", headers=self._headers())
        data = r.json()
        if r.is_error:
            raise SandcastleError(data.get("error", r.text), r.status_code, data)
        return data

    async def aclose(self) -> None:
        await self._client.aclose()
