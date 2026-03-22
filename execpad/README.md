# execpad

Execute **bash**, **Python**, **JavaScript** (Node), and **SQL** (via `sqlite3` CLI) against a **real project directory**—with optional overlay, read-only mode, file-change tracking, and a session run log. Built for **AI agents**, CI, and local tooling.

## Install

```bash
npm install execpad
```

Requires **Node.js ≥ 18**. For SQL on Node, the **`sqlite3`** binary must be on your `PATH`.

## Quick start

```ts
import { Runtime } from "execpad";

const rt = new Runtime("./my-project");
const r = await rt.run("python", 'print(open("README.md").read()[:80])');
console.log(r.stdout);
console.log(r.files); // file changes under the workspace
rt.close();
```

## Features

| Capability | Summary |
|------------|---------|
| **Languages** | `bash`, `python`, `javascript`, `sql` |
| **Workspace modes** | Normal, **read-only** (`readonly: true`), or **overlay** (temp copy + `apply()` back to disk) |
| **File tracking** | `includeGlobs` / `excludeGlobs` (minimatch) scope which paths appear in `RunResult.files` |
| **Limits** | `timeoutMs`, `maxOutputBytes` per run or via `limits` on the runtime |
| **Session log** | `getRunLog()`, `clearRunLog()`, `exportRunLogJSON` / `exportRunLogMarkdown`, optional `onRun` |
| **OpenAI tools** | `asOpenAITool()` + `executeToolCall({ language, code })` |
| **Persistence** | `serialize()` / `Runtime.deserialize()` for overlay state |

## Documentation

| Doc | Contents |
|-----|----------|
| [Getting started](docs/getting-started.md) | Install, first runs, overlay, read-only |
| [Configuration](docs/configuration.md) | `RuntimeOptions`, `RunOptions`, globs, limits, run log |
| [API reference](docs/api-reference.md) | `Runtime`, types, filesystem adapters, exports |
| [Security](docs/security.md) | Threat model, workspace boundaries, subprocess behavior |

## Python

The same concepts are available from Python: `pip install ./python` (see [`python/README.md`](python/README.md) and [docs/python.md](docs/python.md)).

## License

Apache-2.0
