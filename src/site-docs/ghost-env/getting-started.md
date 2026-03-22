# Getting started

## Install

{% ts %}
```bash
npm install ghost-env
```

Requires **Node.js 18+**.
{% /ts %}

{% py %}
```bash
pip install ghost-env
```

Requires **Python 3.10+**.
{% /py %}

## Minimal example

{% ts %}
```ts
import { GhostEnv, github } from "ghost-env";

const env = new GhostEnv({
  seed: 1,
  providers: [
    github({
      issues: [{ repo: "acme/api", title: "First issue", body: "Details" }],
    }),
  ],
});

const res = await env.fetch("https://api.github.com/repos/acme/api/issues");
console.assert(res.status === 200);
const issues = await res.json();
console.log(issues[0].title);
```
{% /ts %}

{% py %}
```python
from ghost_env import GhostEnv, github

env = GhostEnv({
    "seed": 1,
    "providers": [
        github({"issues": [{"repo": "acme/api", "title": "First issue"}]}),
    ],
})

status, text = env.fetch("https://api.github.com/repos/acme/api/issues")
assert status == 200
assert "First issue" in text
```

**Note:** `fetch()` returns `(status: int, body: str)` instead of a `Response` object.
{% /py %}

## How routing works

1. You pass an ordered list of **`providers`** to `GhostEnv`.
2. Each `fetch` walks providers in order; the first provider that handles the URL wins.
3. If none match, `fetch` throws.

## Recording calls

After making calls, inspect history:

{% ts %}
```ts
env.calls();                        // all CallRecord
env.calls("github");                // filter by provider name
env.wasCalled("github", {
  method: "GET",
  pathIncludes: "/issues",
});
```
{% /ts %}

{% py %}
```python
env.calls()                         # all records
env.calls("github")                 # filter by provider
env.was_called("github", method="GET", path_includes="/issues")
```
{% /py %}

## Multiple presets

Combine providers for integration-style tests:

{% ts %}
```ts
new GhostEnv({
  seed: 0,
  providers: [
    github({ issues: [] }),
    stripe({ customers: [{ email: "u@x.com" }] }),
  ],
});
```
{% /ts %}

{% py %}
```python
GhostEnv({
    "seed": 0,
    "providers": [
        github({"issues": []}),
        stripe({"customers": [{"email": "u@x.com"}]}),
    ],
})
```
{% /py %}

Order matters: the first provider that handles a URL wins.

## Next steps

- [Presets](presets.md) for URL patterns and config objects
- [API reference](api-reference.md) for `db()`, `reset`, `snapshot`, exports
- [Testing & chaos](testing-and-chaos.md) for `runEval` / `run_eval` and failure injection
