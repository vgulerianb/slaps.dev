# Configuration

## `RuntimeOptions`

{% ts %}
Passed to `new Runtime(root, options?)`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `readonly` | `boolean` | `false` | Wrap `fs` in a read-only adapter |
| `overlay` | `boolean` | `false` | Copy root to temp dir; use `apply()` to write back |
| `limits` | `ResourceLimits` | see below | Default timeout and output caps |
| `files` | `Record<string, string>` | — | Create files under the workspace root at construction (relative paths) |
| `includeGlobs` | `string[]` | `["**/*"]` | Minimatch patterns for **snapshot** before/after diff scope |
| `excludeGlobs` | `string[]` | `node_modules`, `.git` | Excluded from glob matching |
| `runLog` | `boolean` | `true` | Record each `run()` in memory |
| `runLogMaxEntries` | `number` | `200` | Ring buffer size (oldest dropped) |
| `onRun` | `(entry: RunLogEntry) => void` | — | Called after each logged run |

### `ResourceLimits`

| Field | Default (if unset) | Description |
|-------|---------------------|-------------|
| `timeoutMs` | `30000` | Child process timeout |
| `maxOutputBytes` | `2 * 1024 * 1024` | Truncate combined stdout+stderr; full digest in `hashFull` when truncated |
{% /ts %}

{% py %}
Passed as keyword arguments to `Runtime(root, ...)`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `readonly` | `bool` | `False` | `fs_write` throws when set |
| `overlay` | `bool` | `False` | Copy root to temp dir; use `apply()` to write back |
| `limits` | `dict` | see below | Default timeout and output caps |
| `files` | `dict[str, str]` | — | Create files under the workspace root at construction |
| `include_globs` | `list[str]` | `["**/*"]` | Glob patterns for diff scope (`fnmatch`, `**` supported) |
| `exclude_globs` | `list[str]` | `node_modules`, `.git` | Excluded from glob matching |
| `run_log` | `bool` | `True` | Record each `run()` in memory |
| `run_log_max_entries` | `int` | `200` | Ring buffer size (oldest dropped) |
| `on_run` | callback | — | Called after each logged run |

### `limits` dict

| Key | Default (if unset) | Description |
|-----|---------------------|-------------|
| `timeout_ms` | `30000` | Child process timeout (ms) |
| `max_output_bytes` | `2 * 1024 * 1024` | Truncate combined stdout+stderr |
{% /py %}

## `RunOptions`

{% ts %}
Passed to `runtime.run(language, code, opts?)`. Overrides per run:

- `timeoutMs`, `maxOutputBytes`
- `cwd` — relative to workspace (must stay inside it)
- `env` — extra environment variables for the child process
{% /ts %}

{% py %}
`run()` accepts **`cwd`** and **`env`** keyword arguments. Per-run timeout/output overrides are controlled via **`limits`** on the `Runtime` (not per-call in the Python API today).
{% /py %}

## Session run log

When run logging is enabled, each completed run appends a **`RunLogEntry`** (language, code, cwd, stdout, stderr, exit code, duration, file changes, truncation flag).

{% ts %}
```ts
import { Runtime, exportRunLogJSON } from "agentpad";

const rt = new Runtime("./repo", {
  onRun: (e) => {
    if (e.stderr) console.warn(e.id, e.stderr);
  },
});

await rt.run("bash", "echo hi");
console.log(exportRunLogJSON(rt.getRunLog()));

rt.clearRunLog();
```

Disable entirely: `{ runLog: false }`.
{% /ts %}

{% py %}
```python
from agentpad import Runtime, export_run_log_json

def on_run(e):
    if e.stderr:
        print(e.id, e.stderr)

rt = Runtime("./repo", on_run=on_run)
rt.run("bash", "echo hi")
print(export_run_log_json(rt.get_run_log()))
rt.clear_run_log()
```

Disable entirely: `Runtime("./repo", run_log=False)`.
{% /py %}

## Globs

{% ts %}
`includeGlobs` / `excludeGlobs` use **minimatch** with `dot: true`. They control which files are considered when computing **`RunResult.files`** (created / modified / deleted), not which paths engines can access on disk.
{% /ts %}

{% py %}
`include_globs` / `exclude_globs` are matched with **`fnmatch`** (including `**` via path walking). They control which files are considered when computing **`RunResult.files`**, not which paths engines can access on disk.
{% /py %}
