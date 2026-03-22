# Getting started

## Install

{% ts %}
```bash
npm install execpad
```

Prerequisites: **Node.js 18+**. SQL support requires the `sqlite3` CLI on `$PATH`.
{% /ts %}

{% py %}
```bash
pip install execpad
```

Prerequisites: **Python 3.10+**. SQL uses the standard-library `sqlite3` (no external binary).
{% /py %}

## Quick start

{% ts %}
```ts
import { Runtime } from "execpad";

const rt = new Runtime("./my-project");

const r = await rt.run("python", "print(1 + 1)");
console.log(r.stdout, r.exitCode);

rt.close();
```
{% /ts %}

{% py %}
```python
from execpad import Runtime

rt = Runtime("./my-project")
r = rt.run("python", "print(1 + 1)")
print(r.stdout, r.exit_code)
rt.close()
```
{% /py %}

## Read-only workspace

Prevents writes through the library's `fs` adapter (engines still run shell/Python/Node; treat this as a **library-level** guard, not a kernel sandbox).

{% ts %}
```ts
const rt = new Runtime("./repo", { readonly: true });
// rt.fs.writeFile(...) throws
```
{% /ts %}

{% py %}
```python
rt = Runtime("./repo", readonly=True)
# rt.fs_write(...) throws
```
{% /py %}

## Overlay mode

Copies the project to a temp directory. Runs and mutations happen there until you call `apply()`, which merges the temp tree back.

{% ts %}
```ts
const rt = new Runtime("./repo", { overlay: true });
await rt.run("bash", 'echo "patched" > config.txt');
rt.apply(); // merges back into ./repo
rt.close();
```
{% /ts %}

{% py %}
```python
rt = Runtime("./repo", overlay=True)
rt.run("bash", 'echo "patched" > config.txt')
rt.apply()
rt.close()
```
{% /py %}

## Serialize overlay state

{% ts %}
```ts
const data = rt.serialize();
rt.close();

const rt2 = Runtime.deserialize(data);
```
{% /ts %}

{% py %}
```python
data = rt.serialize()
rt.close()

rt2 = Runtime.deserialize(data)
```
{% /py %}

## Next steps

- [Configuration](configuration.md) for globs, limits, and run log
- [API reference](api-reference.md) for all public types and methods
- [Security](security.md) before exposing to untrusted agents
