import { ArrowRight, ArrowUpRight, Terminal, Code2, Database, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePageMeta } from "../hooks/usePageMeta";

const languages = [
  { name: "bash", icon: Terminal, desc: "Shell scripts and system commands" },
  { name: "python", icon: Code2, desc: "Python 3 with full stdlib access" },
  { name: "javascript", icon: FileText, desc: "Node.js with ESM and CJS support" },
  { name: "sql", icon: Database, desc: "SQLite via the sqlite3 CLI" },
];

const features = [
  {
    label: "Workspace modes",
    items: [
      "Normal — run against the live directory",
      "Read-only — library-level write guard",
      "Overlay — temp copy, apply() to commit",
    ],
  },
  {
    label: "File tracking",
    items: [
      "includeGlobs / excludeGlobs via minimatch",
      "RunResult.files shows changed paths",
      "Serialize and restore overlay state",
    ],
  },
  {
    label: "Agent tooling",
    items: [
      "asOpenAITool() for function-calling",
      "executeToolCall({ language, code })",
      "Session run log with onRun callback",
    ],
  },
  {
    label: "Limits & logging",
    items: [
      "Per-run timeoutMs + maxOutputBytes",
      "getRunLog() / exportRunLogMarkdown()",
      "Structured JSON export for tracing",
    ],
  },
];

export default function ExecpadPage() {
  usePageMeta({
    title: "execpad | Multi-language execution for AI agents",
    description:
      "Execute bash, Python, JavaScript, and SQL against a real project directory. Built for AI agents, CI, and local tooling.",
  });

  return (
    <div className="product-page">
      <section className="product-hero">
        <div>
          <p className="eyebrow">Multi-language runtime</p>
          <h1>execpad</h1>
          <p className="lede">
            Execute bash, Python, JavaScript, and SQL against a real project
            directory — with overlay mode, read-only guards, file-change
            tracking, and OpenAI tool integration. Built for AI agents and CI.
          </p>
          <code className="install-cmd">npm install execpad</code>
          <div className="product-hero__actions">
            <a
              href="https://www.npmjs.com/package/execpad"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View on npm <ArrowRight size={16} />
            </a>
            <Link to="/docs/$product" params={{ product: "execpad" }} className="btn-secondary">
              Docs <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-value">4</div>
              <div className="stat-label">Languages</div>
            </div>
            <div>
              <div className="stat-value">TS</div>
              <div className="stat-label">TypeScript native</div>
            </div>
            <div>
              <div className="stat-value">MIT</div>
              <div className="stat-label">Licensed</div>
            </div>
          </div>
        </div>

        <div className="product-hero__code">
          <div className="code-window">
            <div className="code-window__bar">
              <span /><span /><span />
            </div>
            <pre><code>{`import { Runtime } from "execpad";

const rt = new Runtime("./my-project");

// Run across four languages
await rt.run("bash", "ls -la src/");
await rt.run("python", "import sys; print(sys.version)");
await rt.run("javascript", "console.log(process.version)");
await rt.run("sql", "SELECT count(*) FROM events;");

// Track file changes
const r = await rt.run("bash", "echo patch > fix.txt");
console.log(r.files); // [{ path: "fix.txt", ... }]

// OpenAI function-calling
const tool = rt.asOpenAITool();
rt.close();`}</code></pre>
          </div>
        </div>
      </section>

      <section className="modes-section section">
        <p className="eyebrow">Languages</p>
        <h2>Four engines, one API</h2>
        <div className="modes-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {languages.map((l) => (
            <div className="mode-card" key={l.name}>
              <div className="mode-label">
                <l.icon size={16} />
                {l.name}
              </div>
              <p>{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="highlights-section section">
        <p className="eyebrow">Features</p>
        <h2>Everything agents need</h2>
        <div className="highlight-grid">
          {features.map((f) => (
            <article key={f.label} style={{ flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontWeight: 600, fontSize: "0.9375rem", margin: 0, color: "var(--text-primary)" }}>{f.label}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {f.items.map((item) => (
                  <li key={item} style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span style={{ marginTop: "0.4rem", width: 4, height: 4, borderRadius: "50%", background: "var(--text-tertiary)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="cta-banner" style={{ marginBottom: "6rem" }}>
        <div>
          <h2>Ready to build?</h2>
          <p>Read the full documentation to get started with execpad.</p>
        </div>
        <Link to="/docs/$product" params={{ product: "execpad" }} className="btn-primary">
          Read the docs <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
