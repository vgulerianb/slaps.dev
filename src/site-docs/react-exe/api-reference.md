# API reference

## `CodeExecutor`

The main rendering component.

```tsx
import { CodeExecutor } from "react-exe";

<CodeExecutor
  code={code}       // string | CodeFile[]
  config={config}   // optional CodeExecutorConfig
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `code` | `string \| CodeFile[]` | Component source code, or an array of files |
| `config` | `CodeExecutorConfig` | Optional configuration object |

### `CodeExecutorConfig`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sandbox` | `boolean` | `true` | Render inside an iframe with its own DOM and styles |
| `enableTailwind` | `boolean` | `false` | Load Tailwind CSS for the preview |
| `dependencies` | `Record<string, any>` | `{}` | Modules available to the code, keyed by import path. Keys ending in `/*` match any sub-path |
| `autoResolvePackage` | `boolean` | `true` | Load imports that aren't in `dependencies` from npm via esm.sh |
| `onError` | `(error: Error) => void` | — | Called for compile, security-pattern, package-loading and render errors |
| `securityPatterns` | `RegExp[]` | see below | Code matching any pattern is held back until the user clicks "Continue Anyway" |
| `containerClassName` | `string` | — | Class name for the preview container |
| `containerStyle` | `CSSProperties` | — | Inline styles for the preview container (the sandbox defaults to `minHeight: 360`) |
| `errorClassName` | `string` | — | Class name for the error panel |
| `errorStyle` | `CSSProperties` | — | Inline styles for the error panel |

Default `securityPatterns` flag `document.cookie`, `eval(`, `Function(`, `document.write` and `document.location`. They are heuristics, not a security boundary.

### `CodeFile`

Used when passing multiple files via the `code` prop:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | File path, e.g. `"components/Card.tsx"`; `.css` and `.json` files are supported |
| `content` | `string` | Source for this file |
| `isEntry` | `boolean` | Mark the root component file (defaults to the first file) |

## Notes

- The entry file should **default-export** a component. Without one, an `App` export or a single capitalized component export is used.
- `React` is in scope inside code strings — importing it is optional.
- Code is recompiled when its content changes; editing a string re-renders the preview.
- Syntax errors are shown with the file name and a code frame. Runtime errors are caught by an error boundary.
