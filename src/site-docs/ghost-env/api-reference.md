# API reference

## `GhostEnv`

### Constructor

```ts
new GhostEnv(config: GhostEnvConfig)
```

```python
GhostEnv(config: dict)
# Presets are imported from ghost_env: github, stripe, postgres, s3, slack, anthropic
```

| Field | Type | Description |
|-------|------|-------------|
| `seed` | `number` / `int` | PRNG seed (default `1`) for providers that use `rng` |
| `providers` | `Provider[]` / `list` | Ordered list; first match wins |
| `chaos` | `ChaosOptions` / `dict` | Optional latency / simulated failures |

### Methods

| Method | TypeScript | Python |
|--------|-----------|--------|
| fetch | `fetch(input, init?)` → `Response` | `fetch(url, method?, body?)` → `(int, str)` |
| calls | `calls(provider?)` → `CallRecord[]` | `calls(provider?)` → `list` |
| was_called | `wasCalled(provider, partial?)` | `was_called(provider, **kwargs)` |
| reset | `reset()` | `reset()` |
| snapshot / restore | `snapshot()` / `restore(data)` | `snapshot()` / `restore(data)` |

**Python fetch returns `(status: int, body: str)`** — not a `Response` object.

**Python modules:** `ghost_env.ghost_env` · `ghost_env.presets` · `ghost_env.export` · `ghost_env.eval_runner` · `ghost_env.replay`

### Recording shape

Each **`CallRecord`**: `id`, `provider`, `method`, `url`, `requestBody?`, `responseStatus`, `responseBody?`, `durationMs`.

On thrown errors before a provider responds, the recorder may store **`provider: "error"`**.

## Exports

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

## `ReplayFixture`

Replays **`CallRecord`** responses in order as synthetic **`Response`** objects (JSON content-type). Use for deterministic replays without live providers.
