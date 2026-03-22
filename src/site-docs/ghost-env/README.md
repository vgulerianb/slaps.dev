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

Use **`/docs/...` routes** (bare `*.md` links are unreliable in this app). On the live site these are `https://slaps.dev/docs/...`.

| Doc | Contents |
|-----|----------|
| [Overview](/docs/ghost-env/) | Product summary and sidebar |
| [Getting started](/docs/ghost-env/getting-started) | Providers, fetch, recording (Python: `fetch` → `(status, body)`) |
| [Use cases](/docs/ghost-env/use-cases) | Stubs, fixtures, evals |
| [Presets](/docs/ghost-env/presets) | URLs, config shapes, matching rules |
| [API reference](/docs/ghost-env/api-reference) | `GhostEnv`, `Provider`, eval, replay, exports |
| [Testing & chaos](/docs/ghost-env/testing-and-chaos) | `runEval` / `run_eval`, chaos, failure recording |
| [Python package](/docs/ghost-env/python) | Node vs Python differences |
