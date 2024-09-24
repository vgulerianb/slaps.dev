# sandcastle-sdk (npm)

```bash
npm install
npm run build
```

```ts
import { Sandcastle } from "sandcastle-sdk";

const c = new Sandcastle({ apiKey: "dev" });
const sb = await c.create({});
const r = await sb.exec("node -e \"console.log(1+1)\"");
console.log(r.stdout);
await sb.destroy();
```
