# Configuration

## `RuntimeOptions`

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

## `RunOptions`

Passed to `runtime.run(language, code, opts?)`. Overrides per run:

- `timeoutMs`, `maxOutputBytes`
- `cwd` — relative to workspace (must stay inside it)
- `env` — extra environment variables for the child process

## Session run log

When `runLog` is enabled, each completed run appends a **`RunLogEntry`** (language, code, cwd, stdout, stderr, exit code, duration, file changes, truncation flag).

```ts
import { Runtime, exportRunLogJSON } from "runmix";

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

## Globs

`includeGlobs` / `excludeGlobs` use **minimatch** with `dot: true`. They control which files are considered when computing **`RunResult.files`** (created / modified / deleted), not which paths engines can access on disk.
