# Getting started

1. Start the server (`deploy/docker-compose.yaml` or `cargo run -p sandcastle-core`).
2. Use API key `Bearer` header (`SANDCASTLE_API_KEYS`, default `dev` in Docker).
3. `POST /v1/sandboxes` then `POST /v1/sandboxes/{id}/exec` with `{"command":"..."}`.

Timestamps on commits use ISO-8601; run API with `SANDCASTLE_SKIP_PACKAGE_INSTALL=1` for fast local creates.

## Phase 2 endpoints

- `GET /v1/sandboxes/{id}/exec/stream` (WebSocket; send JSON command first)
- File: `PUT|GET /v1/sandboxes/{id}/files/*path`, list `GET .../files?path=`
- `POST /v1/sandboxes/{id}/snapshot`, `POST /v1/sandboxes/from-snapshot`
- `GET /v1/sandboxes/{id}/replay`, `GET /v1/status`, `GET /v1/network/preview`
