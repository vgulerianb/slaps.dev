import { useState, useEffect, useCallback } from "react";
import { CodeExecutor } from "react-exe";
import type { CodeFile } from "react-exe";
import CodeEditor from "../components/CodeEditor";
import { Copy, Check, RotateCcw, Code2 } from "lucide-react";

interface PlaygroundExample {
  id: string;
  label: string;
  /** One sentence shown under the tabs. */
  summary: string;
  code: string | CodeFile[];
  config: { enableTailwind?: boolean };
}

const EXAMPLES: PlaygroundExample[] = [
  {
    id: "contributions",
    label: "Contributions",
    summary: "React state and Tailwind with zero setup. Click any square to raise its level.",
    config: { enableTailwind: true },
    code: `const LEVELS = ["bg-white/10", "bg-emerald-900", "bg-emerald-700", "bg-emerald-500", "bg-emerald-300"];

export default function Contributions() {
  const [days, setDays] = React.useState(() =>
    Array.from({ length: 7 * 22 }, () => (Math.random() > 0.35 ? Math.floor(Math.random() * 5) : 0))
  );
  const bump = (i) => setDays((d) => d.map((level, j) => (j === i ? (level + 1) % 5 : level)));
  const active = days.filter(Boolean).length;

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Contributions</h2>
          <span className="text-sm text-zinc-400">{active} active days</span>
        </div>
        <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1">
          {days.map((level, i) => (
            <button
              key={i}
              onClick={() => bump(i)}
              className={\`aspect-square rounded-[3px] \${LEVELS[level]} transition hover:ring-2 hover:ring-white/50\`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500">
          Less
          {LEVELS.map((color) => (
            <span key={color} className={\`h-2.5 w-2.5 rounded-[2px] \${color}\`} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    id: "npm-chart",
    label: "npm chart",
    summary: "recharts loads from npm on first run, then charts live download data. Type any package name.",
    config: { enableTailwind: true },
    code: `import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Downloads() {
  const [pkg, setPkg] = React.useState("react");
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetch(\`https://api.npmjs.org/downloads/range/last-month/\${pkg}\`)
      .then((res) => res.json())
      .then((json) => setData(json.downloads ?? []))
      .catch(() => setData([]));
  }, [pkg]);

  const total = data.reduce((sum, day) => sum + day.downloads, 0);

  return (
    <div className="min-h-screen bg-white p-6">
      <input
        value={pkg}
        onChange={(e) => setPkg(e.target.value.trim())}
        className="w-48 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
      />
      <p className="mt-5 text-sm text-gray-500">Downloads in the last 30 days</p>
      <p className="text-3xl font-bold tabular-nums">{total.toLocaleString()}</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <XAxis dataKey="day" hide />
            <Tooltip />
            <Area type="monotone" dataKey="downloads" stroke="#6366f1" strokeWidth={2} fill="#6366f122" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}`,
  },
  {
    id: "animations",
    label: "Animations",
    summary: "framer-motion and lucide-react from npm, sharing this page's React. Add, tick off and delete tasks.",
    config: { enableTailwind: true },
    code: `import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";

let nextId = 4;

export default function Tasks() {
  const [tasks, setTasks] = React.useState([
    { id: 1, text: "Fix CDN resolution", done: true },
    { id: 2, text: "Ship react-exe 1.1.0", done: false },
    { id: 3, text: "Write the changelog", done: false },
  ]);
  const toggle = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const add = () => setTasks((ts) => [...ts, { id: nextId, text: \`New task #\${nextId++}\`, done: false }]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                <button
                  onClick={() => toggle(task.id)}
                  className={\`grid h-5 w-5 place-items-center rounded-full border \${task.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}\`}
                >
                  {task.done && <Check size={12} strokeWidth={3} />}
                </button>
                <span className={\`flex-1 text-sm \${task.done ? "text-slate-400 line-through" : ""}\`}>{task.text}</span>
                <button onClick={() => remove(task.id)} className="text-slate-300 hover:text-rose-500">
                  <Trash2 size={14} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <button
          onClick={add}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-slate-400"
        >
          <Plus size={14} /> Add task
        </button>
      </div>
    </div>
  );
}`,
  },
  {
    id: "multi-file",
    label: "Multi-file",
    summary: "Four files: a component, a custom hook and a CSS file, imported like a real project.",
    config: {},
    code: [
      {
        name: "App.tsx",
        isEntry: true,
        content: `import "./styles.css";
import { StatCard } from "./components/StatCard";
import { useTicker } from "./hooks/useTicker";

export default function App() {
  const visitors = useTicker(1200, 9);
  const signups = useTicker(86, 2);
  const conversion = Math.round((signups / visitors) * 1000) / 10;

  return (
    <main className="stats">
      <StatCard label="Visitors" value={visitors} />
      <StatCard label="Sign-ups" value={signups} />
      <StatCard label="Conversion" value={conversion} unit="%" />
    </main>
  );
}`,
      },
      {
        name: "components/StatCard.tsx",
        content: `interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
}

export function StatCard({ label, value, unit = "" }: StatCardProps) {
  return (
    <section className="card">
      <p className="card-label">{label}</p>
      <p className="card-value">
        {value.toLocaleString()}
        {unit}
      </p>
    </section>
  );
}`,
      },
      {
        name: "hooks/useTicker.ts",
        content: `import { useEffect, useState } from "react";

/** A number that grows a little every second. */
export function useTicker(start: number, step: number) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => v + Math.round(Math.random() * step)), 1000);
    return () => clearInterval(id);
  }, [step]);
  return value;
}`,
      },
      {
        name: "styles.css",
        content: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f8fafc;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 24px;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
}

.card-label {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.card-value {
  margin: 6px 0 0;
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}`,
      },
    ],
  },
  {
    id: "3d-card",
    label: "3D card",
    summary: "A tilt card in plain React and Tailwind. Move your mouse over it.",
    config: { enableTailwind: true },
    code: `export default function ProductCard3D() {
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [likes, setLikes] = React.useState(1284);
  const [isLiked, setIsLiked] = React.useState(false);

  const handleMouseMove = (e) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = (e.clientX - rect.left - rect.width / 2) / 10;
    setRotation({ x: -x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const toggleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div
        className="relative"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-96 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl transition-all duration-300"
          style={{
            transform: \`rotateX(\${rotation.x}deg) rotateY(\${rotation.y}deg) scale(\${isHovered ? 1.05 : 1})\`,
            boxShadow: isHovered 
              ? '0 30px 60px rgba(168, 85, 247, 0.5)' 
              : '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300"
            style={{
              background: \`linear-gradient(\${rotation.y + 90}deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)\`,
              opacity: isHovered ? 1 : 0
            }}
          />

          {/* Content */}
          <div className="relative p-8">
            <div className="flex justify-between items-start mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                NEW
              </span>
              <button
                onClick={toggleLike}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
              >
                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-2">
                Premium Design
              </h3>
              <p className="text-purple-200 text-sm">
                3D Interactive Experience
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎨</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Beautiful Design</div>
                  <div className="text-purple-200 text-xs">Crafted with care</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Interactive</div>
                  <div className="text-purple-200 text-xs">Hover & explore</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">Likes</span>
                <span className="text-white font-bold">{likes.toLocaleString()}</span>
              </div>
              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all shadow-lg">
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  },
];

const configLabel = (config: PlaygroundExample["config"]) =>
  config.enableTailwind ? "config={{ enableTailwind: true }}" : "no config";

/** A paste-ready snippet that renders the current code with react-exe. */
const usageSnippet = (code: string | CodeFile[], config: PlaygroundExample["config"]) => {
  const configProp = config.enableTailwind ? " config={{ enableTailwind: true }}" : "";
  if (typeof code === "string") {
    const escaped = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    return `import { CodeExecutor } from "react-exe";\n\nconst code = \`\n${escaped}\n\`;\n\nexport default function Preview() {\n  return <CodeExecutor code={code}${configProp} />;\n}\n`;
  }
  return `import { CodeExecutor } from "react-exe";\n\nconst files = ${JSON.stringify(code, null, 2)};\n\nexport default function Preview() {\n  return <CodeExecutor code={files}${configProp} />;\n}\n`;
};

const toCopyString = (code: string | CodeFile[]) =>
  typeof code === "string" ? code : code.map((f) => `// ${f.name}\n${f.content}`).join("\n\n");

function ReactExeDocsPlaygroundInner() {
  const [active, setActive] = useState(0);
  const [liveCode, setLiveCode] = useState<string | CodeFile[]>(EXAMPLES[0].code);
  const [debouncedCode, setDebouncedCode] = useState<string | CodeFile[]>(EXAMPLES[0].code);
  const [copied, setCopied] = useState<"code" | "usage" | null>(null);

  const ex = EXAMPLES[active];

  useEffect(() => {
    setLiveCode(EXAMPLES[active].code);
    setDebouncedCode(EXAMPLES[active].code);
  }, [active]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedCode(liveCode), 300);
    return () => window.clearTimeout(id);
  }, [liveCode]);

  const handleReset = useCallback(() => {
    setLiveCode(EXAMPLES[active].code);
  }, [active]);

  const copy = useCallback(async (what: "code" | "usage") => {
    try {
      await navigator.clipboard.writeText(
        what === "code" ? toCopyString(liveCode) : usageSnippet(liveCode, EXAMPLES[active].config)
      );
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [liveCode, active]);

  return (
    <div className="docs-playground">
      <div className="docs-playground__header">
        <div className="docs-playground__tabs" role="tablist" aria-label="Playground examples">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`docs-playground__tab${active === i ? " docs-playground__tab--active" : ""}`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="docs-playground__meta">
          <p className="docs-playground__summary">{ex.summary}</p>
          <div className="docs-playground__toolbar">
            <button type="button" className="docs-playground__action" onClick={() => copy("code")}>
              {copied === "code" ? <Check size={14} className="docs-playground__icon-btn--ok" /> : <Copy size={14} />}
              Copy code
            </button>
            <button type="button" className="docs-playground__action" onClick={() => copy("usage")}>
              {copied === "usage" ? <Check size={14} className="docs-playground__icon-btn--ok" /> : <Code2 size={14} />}
              Copy usage
            </button>
            <button type="button" className="docs-playground__icon-btn" onClick={handleReset} title="Reset to example">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>
      <div className="docs-playground__body">
        <div className="docs-playground__code">
          <CodeEditor code={liveCode} onCodeChange={setLiveCode} onReset={handleReset} showActions={false} />
        </div>
        <div className="docs-playground__preview-wrap">
          <div className="docs-playground__preview-chrome">
            <span className="docs-playground__preview-label">
              <span className="docs-playground__dot" aria-hidden="true" />
              Live preview
            </span>
            <code className="docs-playground__config">{configLabel(ex.config)}</code>
          </div>
          <div className="docs-playground__preview">
            <CodeExecutor key={ex.id} code={debouncedCode} config={ex.config} />
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
