# Getting started

## Install

```bash
npm install react-exe
```

Requires React 18+. No peer dependencies beyond React itself.

## Render a component from a string

```tsx
import { CodeExecutor } from "react-exe";

const code = `
export default function Counter() {
  const [n, setN] = React.useState(0);
  return (
    <div>
      <p>{n}</p>
      <button onClick={() => setN(n + 1)}>+</button>
    </div>
  );
}
`;

export default function App() {
  return <CodeExecutor code={code} />;
}
```

`CodeExecutor` renders the component inside an **iframe sandbox** by default. The global `React` is injected automatically — no need to import it inside the code string.

## Enable Tailwind CSS

```tsx
<CodeExecutor
  code={code}
  config={{ enableTailwind: true }}
/>
```

Injects the Tailwind CDN script inside the sandboxed frame so all utility classes work.

## Disable the sandbox

```tsx
<CodeExecutor
  code={code}
  config={{ sandbox: false }}
/>
```

Renders directly in the parent document instead of an iframe. Useful for tight embedding but removes execution isolation.

## Multi-file components

Pass an array of file objects when the component spans multiple files:

```tsx
const files = [
  {
    name: "App.tsx",
    content: `import Header from '../components/Header';
export default function App() { return <Header />; }`,
    isEntry: true,
  },
  {
    name: "components/Header.tsx",
    content: `export default function Header() { return <h1>Hello</h1>; }`,
  },
];

<CodeExecutor code={files} />
```

## Auto CDN resolution

If the code string imports a package that isn't in `config.dependencies`, react-exe fetches it from CDN automatically:

```tsx
// No manual dependency config needed — date-fns resolves from CDN
const code = `
import { format } from 'date-fns';
export default function Today() {
  return <p>{format(new Date(), 'MMMM do, yyyy')}</p>;
}
`;
```

## Next steps

- [API reference](api-reference.md) for all `CodeExecutor` props and config options
