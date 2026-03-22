# Testing & chaos

## Eval scenarios

{% ts %}
`runEval` runs an array of scenarios sequentially. Each scenario creates a **fresh** `GhostEnv` from `config`, runs `run(env)`, then optional `assert(env)`.

```ts
import { runEval, defineScenario, github } from "stubfetch";

const report = await runEval([
  defineScenario({
    name: "lists issues",
    config: { providers: [github({ issues: [{ repo: "a/b", title: "t" }] })] },
    run: async (env) => {
      await env.fetch("https://api.github.com/repos/a/b/issues");
    },
    assert: (env) => {
      if (!env.wasCalled("github", { method: "GET" })) throw new Error("expected GET");
    },
  }),
]);

console.log(report.passRate, report.results);
```

Failures capture **`error`** strings per scenario; **`passRate`** is `ok / count`.
{% /ts %}

{% py %}
`run_eval` runs a list of scenarios. Each scenario builds a **fresh** `GhostEnv` from `config`, runs `run(env)`, then an optional **`check`** callable (Python `assert` is a keyword, so the API uses `check`).

```python
from stubfetch import run_eval, define_scenario, github


def check_get(env):
    if not env.was_called("github", method="GET"):
        raise RuntimeError("expected GET")


report = run_eval(
    [
        define_scenario(
            name="lists issues",
            config={"providers": [github({"issues": [{"repo": "a/b", "title": "t"}]})]},
            run=lambda env: env.fetch("https://api.github.com/repos/a/b/issues"),
            check=check_get,
        ),
    ]
)

print(report["pass_rate"], report["results"])
```

Failures capture **`error`** strings per scenario; **`pass_rate`** is `ok / count`.
{% /py %}

## Chaos

{% ts %}
```ts
new GhostEnv({
  seed: 99,
  chaos: {
    minLatencyMs: 50, // await before handler runs
    failureRate: 0.1, // 10% throws before provider
  },
  providers: [/* … */],
});
```

- **`failureRate`** uses the seeded RNG; **`0`** disables simulated failures (falsy check).
- Failures throw **`stubfetch chaos: simulated failure`** (after optional latency).
{% /ts %}

{% py %}
```python
GhostEnv(
    {
        "seed": 99,
        "chaos": {
            "min_latency_ms": 50,
            "failure_rate": 0.1,
        },
        "providers": [],
    }
)
```

- **`failure_rate`** uses the seeded RNG; **`0`** disables simulated failures (falsy check).
- Failures raise **`RuntimeError: stubfetch chaos`** (after optional latency).
{% /py %}

## Recording exports

{% ts %}
- **`exportRecordingJSON`** — pretty JSON for fixtures or LLM context.
- **`exportRecordingMarkdown`** — human-readable sections per call.
- **`exportHAR`** — HAR-like JSON (includes extension fields for provider id).

Use these after `fetch` calls with `env.calls()`.
{% /ts %}

{% py %}
- **`export_recording_json`** — pretty JSON for fixtures or LLM context.
- **`export_recording_markdown`** — human-readable sections per call.
- **`export_har`** — HAR-like JSON (includes extension fields for provider id).

Use these after `fetch` calls with `env.calls()`.
{% /py %}
