# Security

- API keys via `Authorization: Bearer`.
- Sandboxes are OS processes with workspace isolation; use containers/Kubernetes for stronger isolation.
- Network egress policy is documented at `GET /v1/network/preview`; enforce with sidecars/mesh in production.
