# runmix (Python)

```bash
pip install -e ./python
```

```python
from runmix import Runtime

rt = Runtime("./my-project")
r = rt.run("python", "print(1+1)")
print(r.stdout)
rt.close()
```

Uses `subprocess` for bash/python/node and stdlib `sqlite3` for SQL. Same options as the npm package: `readonly`, `overlay`, `serialize` / `deserialize`, `as_openai_tool`.
