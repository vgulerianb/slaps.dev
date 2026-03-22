import { useState, useEffect, useMemo, useCallback } from "react";
import { CodeExecutor } from "react-exe";
import type { CodeFile } from "react-exe";
import CodeEditor from "../components/CodeEditor";
import { Copy, Check, RotateCcw } from "lucide-react";

type Example = (typeof EXAMPLES)[number];

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
          type="button"
          onClick={() => setN(n - 1)}
          style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#f5f5f5", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "1rem" }}
        >−</button>
        <button
          type="button"
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
          type="button"
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

function codeFromExample(ex: Example): string | CodeFile[] {
  if ("isMultiFile" in ex && ex.isMultiFile) {
    return JSON.parse(ex.code as string) as CodeFile[];
  }
  return ex.code as string;
}

function toCopyString(code: string | CodeFile[]): string {
  if (typeof code === "string") return code;
  return code.map((f) => `// ${f.name}\n${f.content}`).join("\n\n");
}

function ReactExeDocsPlaygroundInner() {
  const [active, setActive] = useState(0);
  const [liveCode, setLiveCode] = useState<string | CodeFile[]>(() => codeFromExample(EXAMPLES[0]));
  const [debouncedCode, setDebouncedCode] = useState<string | CodeFile[]>(() => codeFromExample(EXAMPLES[0]));
  const [copied, setCopied] = useState(false);

  const ex = EXAMPLES[active];

  useEffect(() => {
    const next = codeFromExample(EXAMPLES[active]);
    setLiveCode(next);
    setDebouncedCode(next);
  }, [active]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedCode(liveCode), 300);
    return () => window.clearTimeout(id);
  }, [liveCode]);

  const handleReset = useCallback(() => {
    setLiveCode(codeFromExample(EXAMPLES[active]));
  }, [active]);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toCopyString(liveCode));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [liveCode]);

  const previewLabel = useMemo(() => {
    const cur = EXAMPLES[active];
    if ("isMultiFile" in cur && cur.isMultiFile) return "Live preview · multi-file";
    if (cur.config && "enableTailwind" in cur.config && cur.config.enableTailwind) return "Live preview · Tailwind enabled";
    return "Live preview";
  }, [active]);

  return (
    <div className="docs-playground">
      <div className="docs-playground__header">
        <div className="docs-playground__header-row">
          <span className="docs-playground__label">Live playground</span>
          <div className="docs-playground__toolbar">
            <button
              type="button"
              className="docs-playground__icon-btn"
              onClick={handleCopyAll}
              title="Copy all code"
            >
              {copied ? <Check size={16} className="docs-playground__icon-btn--ok" /> : <Copy size={16} />}
            </button>
            <button type="button" className="docs-playground__icon-btn" onClick={handleReset} title="Reset to example">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        <div className="docs-playground__tabs" role="tablist" aria-label="Playground examples">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`docs-playground__tab${active === i ? " docs-playground__tab--active" : ""}`}
            >
              <span className="docs-playground__tab-title">{e.label}</span>
              <span className="docs-playground__tab-desc">{e.description}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="docs-playground__body">
        <div className="docs-playground__code">
          <CodeEditor code={liveCode} onCodeChange={setLiveCode} onReset={handleReset} />
        </div>
        <div className="docs-playground__preview-wrap">
          <div className="docs-playground__preview-chrome">
            <span className="docs-playground__preview-label">{previewLabel}</span>
          </div>
          <div className="docs-playground__preview">
            <CodeExecutor key={active} code={debouncedCode} config={ex.config} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Monaco and the runtime executor are client-only; a tiny placeholder avoids SSR/prerender errors.
 */
export function ReactExeDocsPlayground() {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  if (!client) {
    return (
      <div className="docs-playground docs-playground--hydrating">
        <div className="docs-playground-loading">Loading playground…</div>
      </div>
    );
  }
  return <ReactExeDocsPlaygroundInner />;
}
