# execpad (Python)

Multi-language execution against a real directory—aligned with the [`execpad` npm package](../README.md).

## Install

```bash
pip install -e ./python
```

## Quick example

```python
from execpad import Runtime

rt = Runtime("./my-project")
r = rt.run("python", "print(1 + 1)")
print(r.stdout)
rt.close()
```

## Documentation

Full docs live in the repo: **[`docs/`](../docs/README.md)** — start with [Getting started](../docs/getting-started.md) and [Python-specific notes](../docs/python.md).

- Uses **subprocess** for bash, Python, and Node; **stdlib `sqlite3`** for SQL (no `sqlite3` CLI required for SQL in Python).
- Options: `readonly`, `overlay`, `limits`, globs, `serialize` / `deserialize`, session run log, `as_openai_tool` / `execute_tool_call`.

## License

Apache-2.0 (same as the npm package).
