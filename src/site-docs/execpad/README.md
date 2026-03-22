# execpad

Execute **bash**, **Python**, **JavaScript** (Node), and **SQL** against a real project directory — with overlay mode, read-only guards, file-change tracking, and built-in OpenAI tool support. Built for AI agents, CI, and local tooling.

## Install

{% ts %}
```bash
npm install execpad
```

Requires **Node.js 18+**. For SQL, the `sqlite3` binary must be on your `PATH`.
{% /ts %}

{% py %}
```bash
pip install execpad
```

Requires **Python 3.10+**. SQL uses the standard-library `sqlite3` module (no external CLI).
{% /py %}

## Quick start

{% ts %}
```ts
import { Runtime } from "execpad";

const rt = new Runtime("./my-project");

const r = await rt.run("python", 'print(open("README.md").read()[:80])');
console.log(r.stdout);
console.log(r.files); // files changed under the workspace

rt.close();
```
{% /ts %}

{% py %}
```python
from execpad import Runtime

rt = Runtime("./my-project")
r = rt.run("python", 'print(open("README.md").read()[:80])')
print(r.stdout)
print(r.files)
rt.close()
```
{% /py %}

## Languages

| Language | How it runs |
|----------|-------------|
| `bash` | `/bin/bash -c` |
| `python` | `python3 -c` |
| `javascript` | `node --input-type=module` |
| `sql` | `sqlite3` CLI (Node) or stdlib `sqlite3` (Python) |

## Workspace modes

| Mode | Behaviour |
|------|-----------|
| **Normal** | Runs against the live directory |
| **Read-only** | `rt.fs.writeFile()` throws; shell can still write (library-level guard) |
| **Overlay** | Copies to a temp dir; call `rt.apply()` to merge changes back to disk |

## OpenAI function-calling

{% ts %}
```ts
const tool = rt.asOpenAITool();
// returns { type: "function", function: { name, description, parameters } }

const result = rt.executeToolCall({ language: "python", code: "print(42)" });
```
{% /ts %}

{% py %}
```python
tool = rt.as_openai_tool()
result = rt.execute_tool_call({"language": "python", "code": "print(42)"})
```
{% /py %}

## Documentation

{% ts %}
- [Getting started](getting-started.md) — Install, first runs, overlay, read-only
- [Use cases](use-cases.md) — CI, agents, overlay, run log, OpenAI tools (with tests note)
- [Configuration](configuration.md) — `RuntimeOptions`, globs, limits, run log
- [API reference](api-reference.md) — `Runtime`, types, filesystem adapters
- [Security](security.md) — Threat model, workspace boundaries
{% /ts %}

{% py %}
- [Getting started](getting-started.md) — Install, first runs, overlay, read-only
- [Use cases](use-cases.md) — CI, agents, overlay, run log, OpenAI tools (with tests note)
- [Configuration](configuration.md) — `Runtime` kwargs, globs, limits, run log
- [API reference](api-reference.md) — `Runtime`, types, filesystem adapters
- [Security](security.md) — Threat model, workspace boundaries
{% /py %}
