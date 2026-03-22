# ghost-env

**Deterministic, in-process fake HTTP APIs** for testing agents and tools. Swap live network calls for canned GitHub, Stripe, OpenAI, Anthropic, S3, and Slack responses — while recording traffic, running eval scenarios, and injecting chaos.

## Install

{% ts %}
```bash
npm install ghost-env
```

Requires **Node.js 18+**. No runtime dependencies.
{% /ts %}

{% py %}
```bash
pip install ghost-env
```

Requires **Python 3.10+**.
{% /py %}

## Quick start

{% ts %}
```ts
import { GhostEnv, github, exportRecordingJSON } from "ghost-env";

const env = new GhostEnv({
  seed: 42,
  providers: [github({ issues: [{ repo: "acme/api", title: "Bug #1" }] })],
});

const res = await env.fetch("https://api.github.com/repos/acme/api/issues");
const issues = await res.json();
console.log(issues[0].title); // "Bug #1"

// Inspect call history
console.log(env.wasCalled("github")); // true
console.log(exportRecordingJSON(env.calls()));
```
{% /ts %}

{% py %}
```python
from ghost_env import GhostEnv, github, export_recording_json

env = GhostEnv(
    {
        "seed": 42,
        "providers": [github({"issues": [{"repo": "acme/api", "title": "Bug #1"}]})],
    }
)

status, text = env.fetch("https://api.github.com/repos/acme/api/issues")
assert status == 200
assert "Bug #1" in text

print(env.was_called("github"))
print(export_recording_json(env.calls()))
```
{% /py %}

## Presets

{% ts %}
| Preset | Import | URLs handled |
|--------|--------|-------------|
| GitHub | `github()` | `api.github.com` issues, repos, PRs |
| Stripe | `stripe()` | `api.stripe.com` customers, charges |
| OpenAI | `openai()` | `api.openai.com` chat completions |
| Anthropic | `anthropic()` | `api.anthropic.com` messages |
| S3 | `s3()` | `s3.amazonaws.com` GET, list, put |
| Slack | `slack()` | `slack.com/api` auth, messages |
| Postgres | `db()` | In-process `db().query()` |
{% /ts %}

{% py %}
| Preset | Import | URLs handled |
|--------|--------|-------------|
| GitHub | `github()` | `api.github.com` issues, repos, PRs |
| Stripe | `stripe()` | `api.stripe.com` customers, charges |
| Anthropic | `anthropic()` | `api.anthropic.com` messages |
| S3 | `s3()` | `s3.amazonaws.com` GET, list, put |
| Slack | `slack()` | `slack.com/api` auth, messages |
| Postgres | `postgres()` | In-process `env.db().query()` |

OpenAI chat preset is **npm-only** for now; other providers match the table above.
{% /py %}

## Chaos injection

{% ts %}
```ts
const env = new GhostEnv({
  seed: 0,
  providers: [github()],
  chaos: { minLatencyMs: 50, failureRate: 0.1 },
});
```
{% /ts %}

{% py %}
```python
GhostEnv(
    {
        "seed": 0,
        "providers": [github()],
        "chaos": {"min_latency_ms": 50, "failure_rate": 0.1},
    }
)
```
{% /py %}

## Documentation

{% ts %}
- [Getting started](getting-started.md) — Providers, fetch, recording
- [Use cases](use-cases.md) — GitHub/Stripe stubs, fixtures, evals, OpenAI preset (with tests note)
- [Presets](presets.md) — URLs, config shapes, matching rules
- [API reference](api-reference.md) — `GhostEnv`, `Provider`, eval, replay, exports
- [Testing & chaos](testing-and-chaos.md) — `runEval`, chaos options, failure recording
{% /ts %}

{% py %}
- [Getting started](getting-started.md) — Providers, fetch, recording (Python `fetch` returns `(status, body)`)
- [Use cases](use-cases.md) — GitHub/Stripe stubs, fixtures, evals (with tests note)
- [Presets](presets.md) — URLs, config shapes, matching rules
- [API reference](api-reference.md) — `GhostEnv`, `Provider`, eval, replay, exports
- [Testing & chaos](testing-and-chaos.md) — `run_eval`, chaos options, failure recording
{% /py %}
