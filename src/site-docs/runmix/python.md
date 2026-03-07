# Python package

Install from the `python/` directory (editable while developing):

```bash
pip install -e ./python
```

## Usage

```python
from runmix import Runtime, export_run_log_json

rt = Runtime("./my-project")
r = rt.run("python", "print(1 + 1)")
print(r.stdout)
print(r.files)
rt.close()
```

## Parity with npm

| npm | Python |
|-----|--------|
| `readonly=True` | `readonly=True` |
| `overlay=True`, `apply()` | same |
| `limits` dict (`timeout_ms`, `max_output_bytes`) | same keys |
| `include_globs`, `exclude_globs` | same |
| `serialize()` / `deserialize()` | same |
| `get_run_log()`, `clear_run_log()`, `export_run_log_json`, `export_run_log_markdown` | same |
| `run_log`, `run_log_max_entries`, `on_run` | constructor kwargs |
| `as_openai_tool()`, `execute_tool_call()` | same |

## SQL on Python

Uses the standard library **`sqlite3`** module (no external `sqlite3` binary required for the Python SQL path).

## API details

Method names use **snake_case**; result fields use **`exit_code`**, **`duration_ms`** (see `runmix.types`).
