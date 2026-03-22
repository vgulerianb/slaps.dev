# agentpad

Execute **bash**, **Python**, **JavaScript** (Node), and **SQL** against a **real project directory**—with optional overlay, read-only mode, file-change tracking, and a session run log. Built for **AI agents**, CI, and local tooling.

Same design in **TypeScript** (npm) and **Python** (PyPI / local install).

---

## Install

### JavaScript / TypeScript (npm)

```bash
npm install agentpad
```

Requires **Node.js ≥ 18**. For SQL on Node, the **`sqlite3`** binary must be on your `PATH`.

### Python

```bash
pip install agentpad
```

From a clone (editable):

```bash
pip install -e ./python
```

Requires **Python ≥ 3.10**. For SQL in Python, the runtime uses **stdlib `sqlite3`** (no `sqlite3` CLI required).

---

## Quick start

### TypeScript

```ts
import { Runtime } from "agentpad";

const rt = new Runtime("./my-project");
const r = await rt.run("python", 'print(open("README.md").read()[:80])');
console.log(r.stdout);
console.log(r.files); // file changes under the workspace
rt.close();
```

### Python

```python
from agentpad import Runtime

rt = Runtime("./my-project")
r = rt.run("python", "print(1 + 1)")
print(r.stdout)
rt.close()
```

---

## Features

| Capability | Summary |
|------------|---------|
| **Languages** | `bash`, `python`, `javascript`, `sql` |
| **Workspace modes** | Normal, **read-only** (`readonly: true`), or **overlay** (temp copy + `apply()` back to disk) |
| **File tracking** | `includeGlobs` / `excludeGlobs` (minimatch) scope which paths appear in `RunResult.files` |
| **Limits** | `timeoutMs`, `maxOutputBytes` per run or via `limits` on the runtime |
| **Session log** | `getRunLog()`, `clearRunLog()`, `exportRunLogJSON` / `exportRunLogMarkdown`, optional `onRun` |
| **OpenAI tools** | `asOpenAITool()` + `executeToolCall({ language, code })` (TS); `as_openai_tool` / `execute_tool_call` (Python) |
| **Persistence** | `serialize()` / `Runtime.deserialize()` for overlay state |

---

## Documentation

Hosted on **[slaps.dev](https://slaps.dev)**:

| Doc | Contents |
|-----|----------|
| [Overview](https://slaps.dev/docs/agentpad/) | Product summary and doc index |
| [Getting started](https://slaps.dev/docs/agentpad/getting-started) | Install, first runs, overlay, read-only |
| [Use cases](https://slaps.dev/docs/agentpad/use-cases) | Agents, testing patterns, stubfetch |
| [Configuration](https://slaps.dev/docs/agentpad/configuration) | `RuntimeOptions`, `RunOptions`, globs, limits, run log |
| [API reference](https://slaps.dev/docs/agentpad/api-reference) | `Runtime`, types, filesystem adapters, exports |
| [Security](https://slaps.dev/docs/agentpad/security) | Threat model, workspace boundaries, subprocess behavior |
| [Python notes](https://slaps.dev/docs/agentpad/python) | Node vs Python differences |

---

## Source

Package and issue tracker: **[github.com/vgulerianb/agentpad](https://github.com/vgulerianb/agentpad)** (canonical repo). The [slaps.dev](https://github.com/vgulerianb/slaps.dev) monorepo may carry a **vendored copy** of this tree for the website and doc sync scripts—it is not the package’s primary `repository` URL on npm/PyPI.

## License

Apache-2.0
