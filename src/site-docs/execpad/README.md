# agentpad

Execute **bash**, **Python**, **JavaScript** (Node), and **SQL** against a real project directory — with overlay mode, read-only guards, file-change tracking, and built-in OpenAI tool support. Built for AI agents, CI, and local tooling.

## Install

{% ts %}
```bash
npm install agentpad
```

Requires **Node.js 18+**. For SQL, the `sqlite3` binary must be on your `PATH`.
{% /ts %}

{% py %}
```bash
pip install agentpad
```

Requires **Python 3.10+**. SQL uses the standard-library `sqlite3` module (no external CLI).
{% /py %}

## Quick start

{% ts %}
```ts
import { Runtime } from "agentpad";

const rt = new Runtime("./my-project");

const r = await rt.run("python", 'print(open("README.md").read()[:80])');
console.log(r.stdout);
console.log(r.files); // files changed under the workspace

rt.close();
```
{% /ts %}

{% py %}
```python
from agentpad import Runtime

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

Use **`/docs/...` routes** (bare `*.md` links are unreliable in this app). On the live site these are `https://slaps.dev/docs/...`.

| Doc | Contents |
|-----|----------|
| [Overview](/docs/agentpad/) | Product summary and sidebar |
| [Getting started](/docs/agentpad/getting-started) | Install, first runs, overlay, read-only |
| [Use cases](/docs/agentpad/use-cases) | CI, agents, overlay, run log, OpenAI tools |
| [Configuration](/docs/agentpad/configuration) | `RuntimeOptions` / kwargs, globs, limits, run log |
| [API reference](/docs/agentpad/api-reference) | `Runtime`, types, filesystem adapters |
| [Security](/docs/agentpad/security) | Threat model, workspace boundaries |
| [Python package](/docs/agentpad/python) | Node vs Python differences |
