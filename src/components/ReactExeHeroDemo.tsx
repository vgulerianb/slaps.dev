import { CodeExecutor } from "react-exe";

// Shown verbatim and executed live: an npm import, a hook and Tailwind.
const HERO_CODE = `import confetti from "canvas-confetti";

export default function ShipIt() {
  const [shipped, setShipped] = React.useState(0);
  return (
    <div className="grid h-screen place-content-center gap-2 text-center">
      <button
        className="rounded-lg bg-black px-5 py-2 font-semibold text-white"
        onClick={() => { setShipped(shipped + 1); confetti(); }}
      >
        Ship it
      </button>
      <p className="text-xs text-gray-500">Shipped {shipped} times</p>
    </div>
  );
}`;

const HERO_CONFIG = {
  enableTailwind: true,
  containerStyle: { minHeight: 0, height: "100%" },
};

export function ReactExeHeroDemo() {
  return (
    <figure className="rx-demo" aria-label="A code string and its live output">
      <div className="rx-demo__bar">
        <span />
        <span />
        <span />
        <em>App.tsx</em>
      </div>
      <pre className="rx-demo__code">
        <code>{HERO_CODE}</code>
      </pre>
      <figcaption className="rx-demo__label">Output · rendered live by react-exe</figcaption>
      <div className="rx-demo__output">
        <CodeExecutor code={HERO_CODE} config={HERO_CONFIG} />
      </div>
    </figure>
  );
}
