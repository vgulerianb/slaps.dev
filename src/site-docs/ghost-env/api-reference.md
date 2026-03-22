# API reference

## `GhostEnv`

### Constructor

{% ts %}
```ts
new GhostEnv(config: GhostEnvConfig)
```
{% /ts %}

{% py %}
```python
GhostEnv(config: dict)
# Presets: github, stripe, postgres, s3, slack, anthropic (from ghost_env)
```
{% /py %}

| Field | Type | Description |
|-------|------|-------------|
| `seed` | `number` / `int` | PRNG seed (default `1`) for providers that use `rng` |
| `providers` | `Provider[]` / `list` | Ordered list; first match wins |
| `chaos` | `ChaosOptions` / `dict` | Optional latency / simulated failures |

### Methods

{% ts %}
| Method | TypeScript |
|--------|------------|
| `fetch` | `fetch(input, init?)` → `Response` |
| `calls` | `calls(provider?)` → `CallRecord[]` |
| `wasCalled` | `wasCalled(provider, partial?)` → `boolean` |
| `reset` | `reset()` |
| `snapshot` / `restore` | `snapshot()` / `restore(data)` |
{% /ts %}

{% py %}
| Method | Python |
|--------|--------|
| `fetch` | `fetch(url, method?, body?)` → `(int, str)` — not a `Response` object |
| `calls` | `calls(provider?)` → `list` |
| `was_called` | `was_called(provider, **kwargs)` → `bool` |
| `reset` | `reset()` |
| `snapshot` / `restore` | `snapshot()` / `restore(data)` |

**Modules:** `ghost_env` re-exports presets and `export_recording_json`, `export_recording_markdown`, `export_har`, `run_eval`, `define_scenario`, `ReplayFixture`.
{% /py %}

### Recording shape

Each **`CallRecord`**: `id`, `provider`, `method`, `url`, request body, `responseStatus` / `response_status`, response body, `durationMs` / `duration_ms`.

On thrown errors before a provider responds, the recorder may store **`provider: "error"`**.

## Exports

{% ts %}
### Core

- `GhostEnv`, `GhostEnvConfig`, `Provider`
- `WorldState`, `mulberry32` (advanced / tests)

### Recording

- `Recorder`, `CallRecord`
- `exportRecordingJSON`, `exportRecordingMarkdown`, `exportHAR`

### Presets

- Named helpers: `github`, `stripe`, `postgres`, `openai`, `s3`, `slack`, `anthropic`
- Lower-level: `githubProvider`, `stripeProvider`, … (custom `name` / composition)

### Eval & replay

- `runEval`, `defineScenario`, `Scenario`, `EvalReport`
- `ReplayFixture` — `fromJSON`, `nextResponse`, `reset`

### Types

- `ChaosOptions` — `minLatencyMs?`, `failureRate?` (0–1)
{% /ts %}

{% py %}
### Core

- `GhostEnv`, `GhostEnvConfig`, `Provider`

### Recording

- `export_recording_json`, `export_recording_markdown`, `export_har`

### Presets

- `github`, `stripe`, `postgres`, `s3`, `slack`, `anthropic` (no `openai` helper yet)

### Eval & replay

- `run_eval`, `define_scenario`, `ReplayFixture` — `from_json`, `next_response`, `reset`

### Chaos dict keys

- `min_latency_ms`, `failure_rate` (0–1)
{% /py %}

## `ReplayFixture`

{% ts %}
Replays **`CallRecord`** responses in order as synthetic **`Response`** objects (JSON content-type). Use for deterministic replays without live providers.
{% /ts %}

{% py %}
Replays **`CallRecord`**-shaped dicts in order; **`next_response()`** returns `(status: int, body: str)` or `None` when exhausted.
{% /py %}
