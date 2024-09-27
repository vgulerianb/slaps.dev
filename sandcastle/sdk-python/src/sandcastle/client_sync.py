from __future__ import annotations

import asyncio
from typing import Any, Optional

from sandcastle.client import Sandcastle
from sandcastle.sandbox import Sandbox
from sandcastle.types import CreateOptions


class SandcastleSync:
    def __init__(self, api_key: str = "", base_url: str = "http://127.0.0.1:8787"):
        self._inner = Sandcastle(api_key=api_key, base_url=base_url)

    def create(self, opts: Optional[CreateOptions] = None) -> Sandbox:
        return asyncio.run(self._inner.create(opts))

    def fork(self, snapshot_id: str) -> Sandbox:
        return asyncio.run(self._inner.fork(snapshot_id))

    def status(self) -> dict[str, Any]:
        return asyncio.run(self._inner.status())
