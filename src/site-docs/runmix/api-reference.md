# API reference

## `Runtime`

### Constructor

```ts
new Runtime(root: string, options?: RuntimeOptions)
```

```python
Runtime(root: str, **kwargs)
# kwargs: readonly, overlay, limits, include_globs, exclude_globs,
#          run_log, run_log_max_entries, on_run
```

- **`root`**: Absolute or relative path to the project directory.

### Properties

| Name | Type | Description |
|------|------|-------------|
| `root` | `string` | Original root passed in |
| `effectiveRoot` | `string` | Working dir for runs (overlay temp or root) |
| `fs` | `FsAdapter` | Filesystem API over the effective workspace |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `run(lang, code, opts?)` | `Promise<RunResult>` / `RunResult` | Execute code in `effectiveRoot` |
| `apply()` | `void` | Overlay only: merge temp workspace into `root` |
| `close()` | `void` | Remove overlay temp dir |
| `serialize()` | `SerializedRuntime` | Snapshot overlay state |
| `getRunLog()` / `get_run_log()` | `RunLogEntry[]` | Copy of session log (if enabled) |
| `clearRunLog()` / `clear_run_log()` | `void` | Clear in-memory log |
| `asOpenAITool()` / `as_openai_tool()` | OpenAI tool schema | JSON schema for function tools |
| `executeToolCall(args)` / `execute_tool_call(args)` | `RunResult` | `args: { language, code }` |

`Runtime.deserialize(data)` — static factory (TypeScript: `SerializedRuntime`; Python: dict).

**Python notes:** Method names are `snake_case`. `run()` is synchronous. Result fields use `exit_code` and `duration_ms` (see `runmix.types`).

## Types

### `Language`

`"bash" | "python" | "javascript" | "sql"`

### `RunResult`

| Field | TypeScript | Python |
|-------|-----------|--------|
| stdout / stderr | `string` | `str` |
| exitCode / exit_code | `number` | `int` |
| durationMs / duration_ms | `number` | `int` |
| `files` | `FileChange[]` | `list[FileChange]` |
| `truncated` | `boolean` | `bool` |

### `FileChange`

`path`, `type`: `"created" | "modified" | "deleted"`, `size`

### `RuntimeOptions`

| Option | Type | Description |
|--------|------|-------------|
| `readonly` | `bool` | Prevent writes through the `fs` adapter |
| `overlay` | `bool` | Copy project to temp dir; apply on `apply()` |
| `limits` | `dict` | `timeout_ms`, `max_output_bytes` |
| `include_globs` | `list[str]` | File patterns to include in workspace |
| `exclude_globs` | `list[str]` | File patterns to exclude |

### `RunLogEntry`

`id`, `at` (epoch ms), `language`, `code`, `cwd`, `exitCode`/`exit_code`, `durationMs`/`duration_ms`, `stdout`, `stderr`, `truncated`, `files`

## Utilities

| Export | Purpose |
|--------|---------|
| `listMatchingRelPaths` | List files matching globs |
| `truncateOutput` | Same logic as engines for output capping |
| `exportRunLogJSON` / `export_run_log_json` | JSON export of log entries |
| `exportRunLogMarkdown` / `export_run_log_markdown` | Markdown for humans / LLM context |

## OpenAI function-calling

```ts
const tool = rt.asOpenAITool();
// pass tool to the model, then:
const result = await rt.executeToolCall(toolCallArgs);
```

```python
tool = rt.as_openai_tool()
result = rt.execute_tool_call(tool_call_args)
```
