# API reference

## `Runtime`

### Constructor

`new Runtime(root: string, options?: RuntimeOptions)`

- **`root`**: Absolute or relative path; normalized to an absolute project root.

### Properties

| Name | Type | Description |
|------|------|-------------|
| `root` | `string` | Original root passed in |
| `effectiveRoot` | `string` | Working directory for runs and `fs` (overlay temp dir or root) |
| `fs` | `FsAdapter` | Filesystem API over the effective workspace |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `run(lang, code, opts?)` | `Promise<RunResult>` | Execute in `effectiveRoot` |
| `apply()` | `void` | Overlay only: merge temp workspace into `root` |
| `close()` | `void` | Remove overlay temp dir if owned |
| `serialize()` | `SerializedRuntime` | Snapshot overlay state (v1) |
| `getRunLog()` | `RunLogEntry[]` | Copy of session log (if enabled) |
| `clearRunLog()` | `void` | Clear in-memory log |
| `asOpenAITool()` | OpenAI tool schema | JSON schema for `function` tools |
| `executeToolCall(args)` | `Promise<RunResult>` | `args: { language, code }` |

`Runtime.deserialize(data: SerializedRuntime)` — static factory.

## Types

### `Language`

`"bash" | "python" | "javascript" | "sql"`

### `RunResult`

| Field | Type |
|-------|------|
| `stdout`, `stderr` | `string` |
| `exitCode` | `number` |
| `durationMs` | `number` |
| `files` | `FileChange[]` |
| `truncated` | `boolean` |

### `FileChange`

`path`, `type`: `"created" | "modified" | "deleted"`, `size`

### `RunLogEntry`

`id`, `at` (epoch ms), `language`, `code`, `cwd`, `exitCode`, `durationMs`, `stdout`, `stderr`, `truncated`, `files`

### `FsAdapter`

`readFile`, `writeFile`, `exists`, etc.—see type definitions in `dist/index.d.ts`.

## Utilities

| Export | Purpose |
|--------|---------|
| `listMatchingRelPaths(root, include, exclude?)` | List files matching globs |
| `truncateOutput(stdout, stderr, maxBytes)` | Same logic as engines for output capping |
| `exportRunLogJSON(entries, pretty?)` | JSON export of log entries |
| `exportRunLogMarkdown(entries)` | Markdown document for humans / LLM context |

## `RealFs`, `ReadonlyFs`, `OverlayFs`

Lower-level adapters; the default `Runtime` wires **RealFs** or **ReadonlyFs** over `effectiveRoot`. **OverlayFs** is available for advanced use outside the default `Runtime` path.
