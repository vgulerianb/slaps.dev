# sandcastle-sdk (Python)

```bash
pip install -e .
```

```python
import asyncio
from sandcastle import Sandcastle

async def main():
    c = Sandcastle(api_key="dev")
    sb = await c.create()
    r = await sb.exec("echo hello")
    print(r.stdout)
    await sb.destroy()

asyncio.run(main())
```
