# ghost-env

**Deterministic, in-process fake HTTP APIs** for testing agents and tools. Swap live network calls for canned GitHub, Stripe, OpenAI, Anthropic, S3, and Slack responses — while recording traffic, running eval scenarios, and injecting chaos.

## Install

```bash
npm install ghost-env
```

Requires **Node.js 18+**. No runtime dependencies.

## Quick start

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

## Presets

| Preset | Import | URLs handled |
|--------|--------|-------------|
| GitHub | `github()` | `api.github.com` issues, repos, PRs |
| Stripe | `stripe()` | `api.stripe.com` customers, charges |
| OpenAI | `openai()` | `api.openai.com` chat completions |
| Anthropic | `anthropic()` | `api.anthropic.com` messages |
| S3 | `s3()` | `s3.amazonaws.com` GET, list, put |
| Slack | `slack()` | `slack.com/api` auth, messages |
| Postgres | `db()` | In-process `db().query()` |

## Chaos injection

```ts
const env = new GhostEnv({
  seed: 0,
  providers: [github()],
  chaos: { minLatencyMs: 50, failureRate: 0.1 },
});
```

## Documentation

- [Getting started](getting-started.md) — Providers, fetch, recording
- [Presets](presets.md) — URLs, config shapes, matching rules
- [API reference](api-reference.md) — `GhostEnv`, `Provider`, eval, replay, exports
- [Testing & chaos](testing-and-chaos.md) — `runEval`, chaos options, failure recording
- [Python package](python.md) — `pip install ghost-env`
