# API reference

## `CodeExecutor`

The main rendering component.

```tsx
import { CodeExecutor } from "react-exe";

<CodeExecutor
  code={code}       // string | FileObject[]
  config={config}   // optional ExecutorConfig
  key={refreshKey}  // change key to force re-render
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `code` | `string \| FileObject[]` | React component source code or array of file objects |
| `config` | `ExecutorConfig` | Optional configuration object |

### `ExecutorConfig`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sandbox` | `boolean` | `true` | Render in an isolated iframe sandbox |
| `enableTailwind` | `boolean` | `false` | Inject Tailwind CSS CDN into the sandbox frame |
| `dependencies` | `Record<string, unknown>` | `{}` | Pre-provide npm packages by name |
| `autoResolvePackage` | `boolean` | `true` | Auto-fetch missing imports from CDN |
| `height` | `string` | `"100%"` | Iframe height when sandbox is enabled |

### `FileObject`

Used when passing multiple files via the `code` prop:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | File path, e.g. `"components/Card.tsx"` |
| `content` | `string` | Source code for this file |
| `isEntry` | `boolean` | Mark the root component file |

## Notes

- The code string must export a **default** React component.
- `React` is available as a global inside code strings — no import needed.
- When `sandbox: true`, the iframe uses `srcdoc` with a self-contained HTML document.
- To force a re-render (e.g. after editing), change the `key` prop on `CodeExecutor`.
