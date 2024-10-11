# SDK reference

Both SDKs wrap the same REST routes under `/v1`.

- `Sandcastle.create` → `POST /v1/sandboxes`
- `Sandbox.exec` → `POST /v1/sandboxes/{id}/exec`
- Files → `PUT|GET /v1/sandboxes/{id}/files/...`
- `fork` → `POST /v1/sandboxes/from-snapshot`

See `sdk-node/src` and `sdk-python/src/sandcastle` for typings.

WebSocket streaming: Node `Sandbox.execStream` (browser or Node 18+ global WebSocket).
