# Getting started

## Prerequisites

- **Node.js 18+**
- For **`sql`** on Node: the **`sqlite3`** CLI on `PATH`
- **Python 3** / **bash** / **node** available for those engines (platform-dependent names; Python uses `python3` on Unix)

## Install

```bash
npm install runmix
```

## Run code against a directory

```ts
import { Runtime } from "runmix";

const rt = new Runtime("/path/to/repo");

let r = await rt.run("bash", "ls -la");
console.log(r.stdout, r.exitCode);

r = await rt.run("python", "import json; print(json.dumps({'ok': True}))");
console.log(r.stdout);

r = await rt.run("javascript", "console.log(process.version)");
console.log(r.stdout);

rt.close();
```

## Read-only workspace

Prevents writes through the library’s `fs` adapter (engines still run shell/Python/Node and may write if you invoke shell redirection—treat read-only as a **library-level** guard, not a kernel sandbox).

```ts
const rt = new Runtime("./repo", { readonly: true });
// rt.fs.writeFile(...) throws
```

## Overlay mode

Copies the project to a temp directory. Runs and `fs` mutations happen there until you call **`apply()`**, which merges the temp tree back into the original root.

```ts
const rt = new Runtime("./repo", { overlay: true });
await rt.run("bash", 'echo "patched" > config.txt');
rt.apply(); // writes merged tree into ./repo
rt.close();
```

## Serialize overlay state

Capture the overlay workspace as JSON and restore later:

```ts
const data = rt.serialize();
rt.close();

const rt2 = Runtime.deserialize(data);
```

## Next steps

- [Configuration](configuration.md) for globs, limits, and run log
- [API reference](api-reference.md) for all public types and methods
- [Security](security.md) before exposing to untrusted agents
