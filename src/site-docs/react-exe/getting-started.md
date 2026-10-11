# Getting started

## Install

```bash
npm install react-exe
```

Works with React 18 and 19. No bundler configuration is needed. If you added `define: { "process.env": {} }` to your Vite config for an older version, you can remove it.

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

`React` is always in scope inside the code string, so importing it is optional. The code can be TypeScript.

The entry file should default-export the component. Classes, `memo(...)` and `forwardRef(...)` components work too. Without a default export, an `App` export or a single capitalized component export is used.

## Enable Tailwind CSS

```tsx
<CodeExecutor
  code={code}
  config={{ enableTailwind: true }}
/>
```

Loads Tailwind inside the preview so all utility classes work.

## Use npm packages

If the code imports a package that isn't in `config.dependencies`, react-exe loads it from npm via [esm.sh](https://esm.sh):

```tsx
const code = `
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Today() {
  return (
    <motion.p animate={{ opacity: [0, 1] }}>
      {format(new Date(), "MMMM do, yyyy")}
    </motion.p>
  );
}
`;
```

- Packages that use React (framer-motion, Radix, lucide-react, ...) share your app's React instance, so hooks and context work.
- Pin a version in the import itself: `import { format } from "date-fns@3"`. Unpinned imports get the latest version.
- CSS imports from packages work: `import "react-toastify/dist/ReactToastify.css"`.
- Set `autoResolvePackage: false` to require every import to come from `dependencies`.

## Provide your own modules

Pass modules your app already has with `dependencies`. Keys ending in `/*` match any sub-path:

```tsx
import * as ui from "./components/ui";

<CodeExecutor
  code={code}
  config={{
    dependencies: {
      // import { Button } from "@/components/ui/button"
      "@/components/ui/*": ui,
    },
  }}
/>
```

## Multi-file components

Pass an array of file objects when the component spans multiple files:

```tsx
const files = [
  {
    name: "App.tsx",
    content: `import Header from './components/Header';
import './styles.css';
export default function App() { return <Header />; }`,
    isEntry: true,
  },
  {
    name: "components/Header.tsx",
    content: `export default function Header() { return <h1>Hello</h1>; }`,
  },
  {
    name: "styles.css",
    content: `h1 { color: #667eea; }`,
  },
];

<CodeExecutor code={files} />
```

Files can import each other with relative paths, folder `index` files and `@/` aliases (`@/components/Header` resolves to `components/Header.tsx` or `src/components/Header.tsx`). CSS and JSON files are supported.

## Render without the iframe

```tsx
<CodeExecutor
  code={code}
  config={{ sandbox: false }}
/>
```

Renders directly in your page instead of an iframe. Useful for tight embedding, but the code then shares your page's DOM and styles.

## Security

The iframe is same-origin so your app's React can render into it. It isolates DOM and styles, but it is **not a security boundary**: code inside it can reach your page. Only render code you trust, or host the preview on a separate origin for untrusted input.

## Next steps

- [API reference](api-reference.md) for all `CodeExecutor` props and config options
