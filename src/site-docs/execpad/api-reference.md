# API reference

## `Runtime`

### Constructor

{% ts %}
```ts
new Runtime(root: string, options?: RuntimeOptions)
```
{% /ts %}

{% py %}
```python
Runtime(root: str, **kwargs)
# kwargs: readonly, overlay, limits, include_globs, exclude_globs,
#          run_log, run_log_max_entries, on_run
```
{% /py %}

- **`root`**: Absolute or relative path to the project directory.

### Properties

{% ts %}
| Name | Type | Description |
|------|------|-------------|
| `root` | `string` | Original root passed in |
| `effectiveRoot` | `string` | Working dir for runs (overlay temp or root) |
| `fs` | `FsAdapter` | Filesystem API over the effective workspace |
{% /ts %}

{% py %}
| Name | Type | Description |
|------|------|-------------|
| `root` | `Path` | Original root passed in |
| `effective_root` | `Path` | Working dir for runs (overlay temp or root) |
{% /py %}

### Methods

{% ts %}
| Method | Returns | Description |
|--------|---------|-------------|
| `run(lang, code, opts?)` | `Promise<RunResult>` | Execute code in `effectiveRoot` |
| `apply()` | `void` | Overlay only: merge temp workspace into `root` |
| `close()` | `void` | Remove overlay temp dir |
| `serialize()` | `SerializedRuntime` | Snapshot overlay state |
| `getRunLog()` | `RunLogEntry[]` | Copy of session log (if enabled) |
| `clearRunLog()` | `void` | Clear in-memory log |
| `asOpenAITool()` | OpenAI tool schema | JSON schema for function tools |
| `executeToolCall(args)` | `Promise<RunResult>` | `args: { language, code }` |

`Runtime.deserialize(data)` — static factory from `SerializedRuntime`.
{% /ts %}

{% py %}
| Method | Returns | Description |
|--------|---------|-------------|
| `run(lang, code, **opts)` | `RunResult` | Synchronous; executes in `effective_root` |
| `apply()` | `None` | Overlay only: merge temp workspace into `root` |
| `close()` | `None` | Remove overlay temp dir |
| `serialize()` | `SerializedRuntime` | Snapshot overlay state |
| `get_run_log()` | `list` | Copy of session log (if enabled) |
| `clear_run_log()` | `None` | Clear in-memory log |
| `as_openai_tool()` | `dict` | OpenAI tool schema |
| `execute_tool_call(args)` | `RunResult` | `args` with `language`, `code` |

`Runtime.deserialize(data)` — class method; `data` is a serialized dict.

Result fields use **`exit_code`**, **`duration_ms`**, etc. (see `execpad.types`).
{% /py %}

## Types

### `Language`

`"bash" | "python" | "javascript" | "sql"`

### `RunResult`

{% ts %}
| Field | Type |
|-------|------|
| `stdout`, `stderr` | `string` |
| `exitCode` | `number` |
| `durationMs` | `number` |
| `files` | `FileChange[]` |
| `truncated` | `boolean` |
{% /ts %}

{% py %}
| Field | Type |
|-------|------|
| `stdout`, `stderr` | `str` |
| `exit_code` | `int` |
| `duration_ms` | `int` |
| `files` | `list[FileChange]` |
| `truncated` | `bool` |
{% /py %}

### `FileChange`

`path`, `type`: `"created" | "modified" | "deleted"`, `size`

### `RuntimeOptions`

{% ts %}
| Option | Type | Description |
|--------|------|-------------|
| `readonly` | `boolean` | Prevent writes through the `fs` adapter |
| `overlay` | `boolean` | Copy project to temp dir; apply on `apply()` |
| `limits` | `ResourceLimits` | `timeoutMs`, `maxOutputBytes` |
| `includeGlobs` | `string[]` | File patterns for diff scope |
| `excludeGlobs` | `string[]` | Excluded from glob matching |
| `runLog` | `boolean` | Record each `run()` |
| `runLogMaxEntries` | `number` | Ring buffer size |
| `onRun` | callback | Called after each logged run |
{% /ts %}

{% py %}
| Option | Type | Description |
|--------|------|-------------|
| `readonly` | `bool` | Prevent writes via `fs_write` |
| `overlay` | `bool` | Copy project to temp dir; apply on `apply()` |
| `limits` | `dict` | `timeout_ms`, `max_output_bytes` |
| `include_globs` | `list[str]` | File patterns for diff scope |
| `exclude_globs` | `list[str]` | Excluded from glob matching |
| `run_log` | `bool` | Record each `run()` |
| `run_log_max_entries` | `int` | Ring buffer size |
| `on_run` | callback | Called after each logged run |
{% /py %}

### `RunLogEntry`

{% ts %}
`id`, `at` (epoch ms), `language`, `code`, `cwd`, `exitCode`, `durationMs`, `stdout`, `stderr`, `truncated`, `files`
{% /ts %}

{% py %}
`id`, `at`, `language`, `code`, `cwd`, `exit_code`, `duration_ms`, `stdout`, `stderr`, `truncated`, `files`
{% /py %}

## Utilities

{% ts %}
| Export | Purpose |
|--------|---------|
| `listMatchingRelPaths` | List files matching globs |
| `truncateOutput` | Same logic as engines for output capping |
| `exportRunLogJSON` | JSON export of log entries |
| `exportRunLogMarkdown` | Markdown for humans / LLM context |
{% /ts %}

{% py %}
| Export | Purpose |
|--------|---------|
| `export_run_log_json` | JSON export of log entries |
| `export_run_log_markdown` | Markdown for humans / LLM context |
{% /py %}

## OpenAI function-calling

{% ts %}
```ts
const tool = rt.asOpenAITool();
// pass tool to the model, then:
const result = await rt.executeToolCall(toolCallArgs);
```
{% /ts %}

{% py %}
```python
tool = rt.as_openai_tool()
result = rt.execute_tool_call(tool_call_args)
```
{% /py %}
