# Self-hosting

- Set `SANDCASTLE_DATA_DIR` on a persistent volume.
- Tune `SANDCASTLE_MAX_CONCURRENT` and `SANDCASTLE_TENANT_QUOTAS` (e.g. `teamA:10,teamB:5`).
- Use Helm chart under `deploy/helm/sandcastle`.
