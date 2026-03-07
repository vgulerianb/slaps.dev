# Getting started

## Install

```bash
npm install runmix
```

```bash
pip install runmix
```

Prerequisites: **Node.js 18+** for TypeScript/npm; **Python 3.10+** for pip. SQL support on Node requires the `sqlite3` CLI on `$PATH`; Python uses the standard-library `sqlite3` (no binary needed).

## Quick start

```ts
import { Runtime } from "runmix";

const rt = new Runtime("./my-project");

const r = await rt.run("python", "print(1 + 1)");
console.log(r.stdout, r.exitCode);

rt.close();
```

```python
from runmix import Runtime

rt = Runtime("./my-project")
r = rt.run("python", "print(1 + 1)")
print(r.stdout)
rt.close()
```

## Read-only workspace

Prevents writes through the library's `fs` adapter (engines still run shell/Python/Node; treat this as a **library-level** guard, not a kernel sandbox).

```ts
const rt = new Runtime("./repo", { readonly: true });
// rt.fs.writeFile(...) throws
```

```python
rt = Runtime("./repo", readonly=True)
```

## Overlay mode

Copies the project to a temp directory. Runs and mutations happen there until you call `apply()`, which merges the temp tree back.

```ts
const rt = new Runtime("./repo", { overlay: true });
await rt.run("bash", 'echo "patched" > config.txt');
rt.apply(); // merges back into ./repo
rt.close();
```

```python
rt = Runtime("./repo", overlay=True)
rt.run("bash", 'echo "patched" > config.txt')
rt.apply()
rt.close()
```

## Serialize overlay state

```ts
const data = rt.serialize();
rt.close();

const rt2 = Runtime.deserialize(data);
```

```python
data = rt.serialize()
rt.close()

rt2 = Runtime.deserialize(data)
```

## Next steps

- [Configuration](configuration.md) for globs, limits, and run log
- [API reference](api-reference.md) for all public types and methods
- [Security](security.md) before exposing to untrusted agents
