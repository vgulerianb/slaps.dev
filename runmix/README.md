# runmix

Run **bash**, **python**, **javascript** (Node), and **sql** (sqlite3 CLI) against a **real directory** — for AI agents and tooling.

```bash
npm install runmix
```

```ts
import { Runtime } from "runmix";

const rt = new Runtime("./my-project");
const r = await rt.run("python", `print(open("README.md").read()[:80])`);
console.log(r.stdout);
rt.close();
```

- **Read-only** workspace: `new Runtime("./repo", { readonly: true })`
- **Overlay** (copy workspace to temp, `apply()` to write back): `{ overlay: true }`
- **Persistence**: `serialize()` / `Runtime.deserialize()` for session restore
- **Globs**: `includeGlobs` / `excludeGlobs` for file-change tracking scope
- **OpenAI**: `asOpenAITool()` + `executeToolCall(args)`

Python: `pip install ./python` from `runmix/python` (see `python/README.md`).

SQL on Node requires `sqlite3` on your PATH. Use the Python package for stdlib `sqlite3` only.

License: Apache-2.0
