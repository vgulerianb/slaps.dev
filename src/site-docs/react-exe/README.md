# react-exe

Execute React components from raw **code strings** directly in the browser — no build step required. Auto-resolves npm packages from CDN, renders inside a secure iframe sandbox, and supports Tailwind CSS out of the box.

## Install

```bash
npm install react-exe
```

Requires **React 18+**.

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
| **Runtime execution** | Transpiles and renders React components on the fly |
| **Auto CDN resolution** | Missing imports are fetched from jsDelivr / unpkg automatically |
| **Sandboxed iframe** | Isolates execution; prevents host app interference |
| **Multi-file** | Pass an array of `{ name, content, isEntry }` for complex components |
| **Tailwind CSS** | `enableTailwind: true` loads Tailwind CDN inside the sandbox |
| **TypeScript** | Code strings can use TypeScript syntax |

## Live examples

The playground below shows react-exe running in real time. Try the examples to see the `CodeExecutor` in action — then head to the docs to learn how each feature works.

## Documentation

- [Getting started](getting-started.md) — Install, first render, sandbox, Tailwind
- [API reference](api-reference.md) — `CodeExecutor` props, `ExecutorConfig`, multi-file format
