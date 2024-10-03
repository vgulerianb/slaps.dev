# Sandcastle

Programmable sandboxes for AI agents: Python + Node, queue-aware capacity, REST + WebSocket.

## Quick start (Docker)

```bash
cd deploy && docker compose up --build
export SANDCASTLE_API_KEY=dev
curl -s http://127.0.0.1:8787/v1/health
curl -s -H "Authorization: Bearer dev" -H "Content-Type: application/json" \
  -d '{}' http://127.0.0.1:8787/v1/sandboxes
```

## Run API locally (Rust)

```bash
export SANDCASTLE_API_KEYS=dev
export SANDCASTLE_DATA_DIR=./data
export SANDCASTLE_SKIP_PACKAGE_INSTALL=1
cargo run -p sandcastle-core
```

## SDKs

- **npm:** `sdk-node/` → package name `sandcastle-sdk`
- **pip:** `sdk-python/` → package name `sandcastle-sdk`

## Optional remote worker

Set `SANDCASTLE_WORKER_BASE=http://worker:9797` on the API and run `docker compose --profile worker up`.

## Docs

See `docs/` and `PLAN.md`.
