# runmix

Execute **bash**, **Python**, **JavaScript** (Node), and **SQL** against a real project directory — with overlay mode, read-only guards, file-change tracking, and built-in OpenAI tool support. Built for AI agents, CI, and local tooling.

## Install

```bash
npm install runmix
```

Requires **Node.js 18+**. For SQL, the `sqlite3` binary must be on your `PATH`.

## Quick start

```ts
import { Runtime } from "runmix";

const rt = new Runtime("./my-project");

const r = await rt.run("python", 'print(open("README.md").read()[:80])');
console.log(r.stdout);
console.log(r.files); // files changed under the workspace

rt.close();
```

## Languages

| Language | How it runs |
|----------|-------------|
| `bash` | `/bin/bash -c` |
| `python` | `python3 -c` |
| `javascript` | `node --input-type=module` |
| `sql` | `sqlite3 <db>` via the CLI |

## Workspace modes

| Mode | Behaviour |
|------|-----------|
| **Normal** | Runs against the live directory |
| **Read-only** | `rt.fs.writeFile()` throws; shell can still write (library-level guard) |
| **Overlay** | Copies to a temp dir; call `rt.apply()` to merge changes back to disk |

## OpenAI function-calling

```ts
const tool = rt.asOpenAITool();
// returns { type: "function", function: { name, description, parameters } }

const result = rt.executeToolCall({ language: "python", code: "print(42)" });
```

## Documentation

- [Getting started](getting-started.md) — Install, first runs, overlay, read-only
- [Configuration](configuration.md) — `RuntimeOptions`, globs, limits, run log
- [API reference](api-reference.md) — `Runtime`, types, filesystem adapters
- [Security](security.md) — Threat model, workspace boundaries
- [Python package](python.md) — `pip install runmix`
