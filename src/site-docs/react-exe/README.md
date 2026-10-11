# react-exe

Render React components from **code strings** directly in the browser — no bundler, no build step. TypeScript and JSX compile in milliseconds, npm imports resolve automatically from CDN, and previews run in an isolated iframe with optional Tailwind CSS.

## Install

```bash
npm install react-exe
```

Works with **React 18 and 19**. No bundler configuration needed.

## Quick start

```tsx
import { CodeExecutor } from "react-exe";

const code = `
export default function Hello() {
  return <h1 style={{ color: "#667eea" }}>Hello from react-exe!</h1>;
}
`;

export default function App() {
  return <CodeExecutor code={code} />;
}
```

## Features

| Feature | Details |
|---------|---------|
| **Runtime execution** | Compiles TypeScript and JSX with Sucrase (about a millisecond per file) and renders the result |
| **Auto CDN resolution** | Missing imports load from npm via esm.sh and share your app's React, so hooks and context work |
| **Isolated iframe** | Previews get their own DOM and styles; set `sandbox: false` to render inline |
| **Multi-file** | Pass an array of `{ name, content, isEntry }` with relative imports, `@/` aliases, CSS and JSON files |
| **Tailwind CSS** | `enableTailwind: true` loads Tailwind inside the preview |
| **Your own modules** | Pass components and libraries via `dependencies`, including wildcard keys like `"@/components/ui/*"` |
| **Small** | About 55 KB gzipped |

## Live examples

The playground below shows react-exe running in real time. Try the examples to see the `CodeExecutor` in action — then head to the docs to learn how each feature works.

## Documentation

- [Getting started](getting-started.md) — Install, first render, Tailwind, npm packages, multi-file
- [API reference](api-reference.md) — `CodeExecutor` props, config options, multi-file format
