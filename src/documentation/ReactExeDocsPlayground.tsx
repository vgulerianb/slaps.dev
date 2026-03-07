import { useState } from "react";
import { CodeExecutor } from "react-exe";

const EXAMPLES = [
  {
    label: "Counter",
    description: "Basic useState hook",
    code: `export default function Counter() {
  const [n, setN] = React.useState(0);
  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "3.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
        {n}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <button
          onClick={() => setN(n - 1)}
          style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#f5f5f5", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "1rem" }}
        >−</button>
        <button
          onClick={() => setN(n + 1)}
          style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#0a0a0a", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >+</button>
      </div>
    </div>
  );
}`,
    config: {},
  },
  {
    label: "Tailwind CSS",
    description: "enableTailwind: true",
    code: `export default function Card() {
  const [liked, setLiked] = React.useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xs w-full">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4 text-xl">⚡</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">react-exe</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Render React from code strings. Tailwind works natively inside the sandbox.
        </p>
        <button
          onClick={() => setLiked(!liked)}
          className={\`w-full py-2 rounded-xl text-sm font-semibold transition-colors \${
            liked ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }\`}
        >
          {liked ? "❤️ Liked!" : "Like this"}
        </button>
      </div>
    </div>
  );
}`,
    config: { enableTailwind: true },
  },
  {
    label: "CDN auto-resolve",
    description: "No manual dependencies",
    code: `import { format, addDays } from 'date-fns';

export default function DateCalc() {
  const [offset, setOffset] = React.useState(7);
  const today = new Date();
  const target = addDays(today, offset);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <p style={{ color: "#999", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
        date-fns resolved from CDN automatically
      </p>
      <p style={{ fontSize: "0.875rem", color: "#666", margin: "0 0 0.25rem" }}>Today</p>
      <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1.25rem" }}>
        {format(today, "MMMM do, yyyy")}
      </p>
      <p style={{ fontSize: "0.875rem", color: "#666", margin: "0 0 0.25rem" }}>+{offset} days</p>
      <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1.25rem" }}>
        {format(target, "MMMM do, yyyy")}
      </p>
      <input
        type="range" min={1} max={30} value={offset}
        onChange={e => setOffset(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}`,
    config: {},
  },
  {
    label: "Multi-file",
    description: "Array of FileObject",
    isMultiFile: true as const,
    code: JSON.stringify([
      {
        name: "App.tsx",
        isEntry: true,
        content: `import Badge from './Badge';
import Card from './Card';
export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Card title="Feature A" badge="stable" />
      <Card title="Feature B" badge="beta" />
      <Card title="Feature C" badge="new" />
    </div>
  );
}`,
      },
      {
        name: "Card.tsx",
        content: `import Badge from './Badge';
export default function Card({ title, badge }: { title: string; badge: string }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{title}</span>
      <Badge label={badge} />
    </div>
  );
}`,
      },
      {
        name: "Badge.tsx",
        content: `const COLORS: Record<string, string> = { stable: "#dcfce7", beta: "#fef9c3", new: "#ede9fe" };
const TEXT: Record<string, string> = { stable: "#16a34a", beta: "#a16207", new: "#7c3aed" };
export default function Badge({ label }: { label: string }) {
  return (
    <span style={{ background: COLORS[label] ?? "#f3f4f6", color: TEXT[label] ?? "#374151", borderRadius: "6px", padding: "0.15rem 0.5rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}`,
      },
    ]),
    config: {},
  },
] as const;

export function ReactExeDocsPlayground() {
  const [active, setActive] = useState(0);
  const ex = EXAMPLES[active];
  const isMulti = "isMultiFile" in ex && ex.isMultiFile;
  const code = isMulti ? JSON.parse(ex.code as string) : (ex.code as string);
  const displayCode = isMulti
    ? (code as { name: string; content: string }[])
        .map((f) => `// ${f.name}\n${f.content}`)
        .join("\n\n")
    : (ex.code as string);

  return (
    <div className="docs-playground">
      <div className="docs-playground__header">
        <span className="docs-playground__label">Live playground</span>
        <div className="docs-playground__tabs">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              onClick={() => setActive(i)}
              className={`docs-playground__tab${active === i ? " docs-playground__tab--active" : ""}`}
            >
              {e.label}
              <span className="docs-playground__tab-desc">{e.description}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="docs-playground__body">
        <div className="docs-playground__code">
          <pre>
            <code>{displayCode}</code>
          </pre>
        </div>
        <div className="docs-playground__preview">
          <CodeExecutor key={active} code={code} config={ex.config} />
        </div>
      </div>
    </div>
  );
}
