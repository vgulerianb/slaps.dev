# Use cases & examples

**stubfetch** replaces live HTTP with deterministic in-process handlers—ideal for agent evals, integration tests, and recording traffic.

**Automated tests:** Node uses **Vitest** (`ghost-env/src/*.test.ts`); Python uses **pytest** (`ghost-env/python/tests/`). From the site repo run `npm run test:packages` to run agentpad + stubfetch packages in both languages.

**Python vs Node:** `fetch()` in Python returns **`(status: int, body: str)`**. The npm `openai()` chat preset exists only on the **TypeScript** side today; Python covers GitHub, Stripe, S3, Slack, Anthropic, Postgres, etc.

---

## Testing agents with stubfetch

**stubfetch** is for **tests and evals**: you control what HTTP **looks like** so the agent’s behavior is **repeatable**. Common patterns:

1. **Inject `env.fetch`** (or wrap `globalThis.fetch`) so the agent’s code never hits the real network.
2. **Seed providers** (GitHub, Stripe, …) with the exact JSON your scenario needs.
3. After the agent finishes, **`wasCalled` / `was_called`** and **`calls()`** prove it hit the right APIs with the right methods/paths.
4. Use **`runEval` / `run_eval`** to run many scenarios in one script; add **chaos** from [Testing & chaos](testing-and-chaos.md) to stress error handling.

### Inject deterministic `fetch` into your agent

Your agent module should accept a **`fetch` implementation** (dependency injection). In tests, pass **`GhostEnv#fetch`**.

{% ts %}
```ts
import { GhostEnv, github } from "stubfetch";

type AgentFetch = typeof fetch;

/** Example: agent that lists issues using injected fetch */
export async function agentListIssues(fetchImpl: AgentFetch, repo: string) {
  const res = await fetchImpl(`https://api.github.com/repos/${repo}/issues`);
  if (!res.ok) throw new Error(`github ${res.status}`);
  return res.json();
}

// Test: no network — stubbed issues only
export async function testAgentUsesGithubStub() {
  const env = new GhostEnv({
    seed: 1,
    providers: [
      github({
        issues: [{ repo: "acme/api", title: "Stub issue", body: "test" }],
      }),
    ],
  });

  const data = await agentListIssues(env.fetch.bind(env) as AgentFetch, "acme/api");
  console.assert(Array.isArray(data) && data[0].title === "Stub issue");
  console.assert(env.wasCalled("github", { method: "GET" }));
}
```
{% /ts %}

{% py %}
```python
from stubfetch import GhostEnv, github


def agent_list_issues(fetch_impl, repo: str):
    status, text = fetch_impl(f"https://api.github.com/repos/{repo}/issues")
    if status != 200:
        raise RuntimeError(f"github {status}")
    return text


def test_agent_uses_github_stub():
    env = GhostEnv(
        {
            "seed": 1,
            "providers": [
                github(
                    {"issues": [{"repo": "acme/api", "title": "Stub issue", "body": "test"}]}
                ),
            ],
        }
    )
    text = agent_list_issues(env.fetch, "acme/api")
    assert "Stub issue" in text
    assert env.was_called("github", method="GET")
```
{% /py %}

If you cannot change the agent API, wrap **`globalThis.fetch`** in test setup (restore after) or use your runtime’s hook for outbound HTTP.

### End-to-end style: run the agent inside `runEval`

Use **`run`** to invoke your agent entrypoint; use **`assert` / `check`** to validate **`env`** after it returns.

{% ts %}
```ts
import { runEval, defineScenario, github, stripe } from "stubfetch";

const report = await runEval([
  defineScenario({
    name: "agent lists stubbed issues",
    config: {
      providers: [
        github({ issues: [{ repo: "acme/api", title: "Eval ticket" }] }),
        stripe({ customers: [{ email: "u@x.com" }] }),
      ],
    },
    run: async (env) => {
      // Replace with: await runMyAgent(env) where your agent uses env.fetch
      const res = await env.fetch("https://api.github.com/repos/acme/api/issues");
      console.assert(res.status === 200);
      await res.json();
    },
    assert: (env) => {
      if (!env.wasCalled("github", { method: "GET" }))
        throw new Error("expected GitHub list");
    },
  }),
]);

console.log(report.passRate, report.results);
```
{% /ts %}

{% py %}
```python
from stubfetch import run_eval, define_scenario, github, stripe


def run_agent_or_tooling(env):
    # Replace with: run_my_agent(env) where your code uses env.fetch
    status, text = env.fetch("https://api.github.com/repos/acme/api/issues")
    assert status == 200
    assert "Eval ticket" in text


def check_github(env):
    if not env.was_called("github", method="GET"):
        raise RuntimeError("expected GitHub list")


report = run_eval(
    [
        define_scenario(
            name="agent lists stubbed issues",
            config={
                "providers": [
                    github({"issues": [{"repo": "acme/api", "title": "Eval ticket"}]}),
                    stripe({"customers": [{"email": "u@x.com"}]}),
                ]
            },
            run=run_agent_or_tooling,
            check=check_github,
        )
    ]
)
print(report["pass_rate"], report["results"])
```
{% /py %}

(`my_agent` is illustrative—point the import at your real agent module.)

### Golden recordings for regression

After a successful agent run, **`exportRecordingJSON` / `export_recording_json`** can be committed as a **baseline**; diff when behavior changes—see **§3 Record calls** below.

---

## 1. Stub GitHub for an agent test

{% ts %}
```ts
import { GhostEnv, github, exportRecordingJSON } from "stubfetch";

const env = new GhostEnv({
  seed: 7,
  providers: [
    github({
      issues: [{ repo: "acme/api", title: "P0 outage", body: "details here" }],
    }),
  ],
});

const res = await env.fetch("https://api.github.com/repos/acme/api/issues");
console.assert(res.status === 200);
const data = await res.json();
console.assert(data[0].title === "P0 outage");

console.log(exportRecordingJSON(env.calls()));
```
{% /ts %}

{% py %}
```python
from stubfetch import GhostEnv, github, export_recording_json

env = GhostEnv(
    {
        "seed": 7,
        "providers": [
            github({"issues": [{"repo": "acme/api", "title": "P0 outage", "body": "details"}]}),
        ],
    }
)

status, text = env.fetch("https://api.github.com/repos/acme/api/issues")
assert status == 200
assert "P0 outage" in text
assert env.was_called("github", method="GET")

print(export_recording_json(env.calls()))
```
{% /py %}

---

## 2. Stripe + GitHub together (integration-style)

{% ts %}
```ts
import { GhostEnv, github, stripe } from "stubfetch";

const env = new GhostEnv({
  providers: [
    github({ issues: [{ repo: "acme/billing", title: "Invoice bug" }] }),
    stripe({ customers: [{ email: "vip@acme.com" }] }),
  ],
});

const customers = await env.fetch("https://api.stripe.com/v1/customers");
console.assert(customers.status === 200);

const issues = await env.fetch("https://api.github.com/repos/acme/billing/issues");
console.assert(issues.status === 200);
```
{% /ts %}

{% py %}
```python
from stubfetch import GhostEnv, github, stripe

env = GhostEnv(
    {
        "providers": [
            github({"issues": [{"repo": "acme/billing", "title": "Invoice bug"}]}),
            stripe({"customers": [{"email": "vip@acme.com"}]}),
        ]
    }
)

st, _ = env.fetch("https://api.stripe.com/v1/customers")
assert st == 200
st2, _ = env.fetch("https://api.github.com/repos/acme/billing/issues")
assert st2 == 200
```
{% /py %}

Providers are tried **in order**; the first match wins.

---

## 3. Record calls for a fixture or LLM transcript

After exercising `fetch`, export a stable JSON trace.

{% ts %}
```ts
import { writeFileSync } from "node:fs";
import { GhostEnv, github, exportRecordingJSON } from "stubfetch";

const env = new GhostEnv({ providers: [github({ issues: [] })] });
await env.fetch("https://api.github.com/repos/acme/api/issues");

writeFileSync("fixture.json", exportRecordingJSON(env.calls()));
```
{% /ts %}

{% py %}
```python
from pathlib import Path
from stubfetch import GhostEnv, github, export_recording_json

env = GhostEnv({"providers": [github({"issues": []})]})
env.fetch("https://api.github.com/repos/acme/api/issues")

Path("fixture.json").write_text(export_recording_json(env.calls()), encoding="utf8")
```
{% /py %}

---

## 4. Eval harness (sequential scenarios)

{% ts %}
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
{% /ts %}

{% py %}
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
        )
    ]
)
print(report["pass_rate"], report["results"])
```
{% /py %}

Python uses **`check=`** instead of `assert` (keyword conflict).

---

## 5. TypeScript-only: canned OpenAI chat completions

{% ts %}
```ts
import { GhostEnv, openai } from "stubfetch";

const env = new GhostEnv({
  providers: [
    openai({
      responses: [
        {
          match: { model: "gpt-4" },
          response: { choices: [{ message: { content: "pong" } }] },
        },
      ],
    }),
  ],
});

const res = await env.fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  body: JSON.stringify({ model: "gpt-4", messages: [] }),
});
const body = await res.json();
console.log(body.choices[0].message.content);
```
{% /ts %}

{% py %}
The **`openai()`** helper is not bundled in the published Python package yet. Use the npm package for OpenAI-shaped stubs, or implement a custom `Provider` on the Python side.
{% /py %}

---

## Next steps

- [Presets](presets.md) — URL patterns and config shapes
- [API reference](api-reference.md) — `GhostEnv`, recording, replay
- [Testing & chaos](testing-and-chaos.md) — chaos options and exports
