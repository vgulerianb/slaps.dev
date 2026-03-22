import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";

const products = [
  {
    name: "React-EXE",
    pill: "UI Runtime",
    description:
      "Render React components from raw code strings in the browser. Ships with auto CDN dependency resolution, iframe sandboxing, Tailwind CSS, and multi-file support.",
    install: "npm install react-exe",
    features: [
      "TypeScript & JSX out of the box",
      "Secure iframe sandbox mode",
      "Automatic CDN package resolution",
      "Multi-file component support",
    ],
    to: "/react-exe",
    cta: "Open playground",
  },
  {
    name: "Slapify",
    pill: "Automation",
    description:
      "AI-powered browser automation that slaps. Run autonomous agents, audit performance, and write E2E tests in plain English. Just give it a task and let it work.",
    install: "npx slapify init",
    features: [
      "Autonomous task agents",
      "English-first .flow test files",
      "Built-in performance audits",
      "LLM-provider agnostic",
    ],
    to: "/slapify",
    cta: "Learn more",
  },
  {
    name: "execpad",
    pill: "Agent runtime",
    description:
      "Run shell, Node, and Python against a real project directory with allowlists, timeouts, and structured output—built for AI agents and copilots. npm and PyPI (`pip install execpad`).",
    install: "npm install execpad",
    features: [
      "Multi-language exec with cwd + env control",
      "Glob-based allowlists and timeouts",
      "Structured stdout/stderr and exit codes",
      "TypeScript and Python SDKs",
    ],
    to: "/execpad",
    cta: "Read the docs",
  },
  {
    name: "ghost-env",
    pill: "Testing",
    description:
      "Deterministic fake HTTP APIs and SQLite-backed stores so agent flows stay reproducible in CI. Stub routes, assert call history, reset between tests. npm and PyPI (`pip install ghost-env`).",
    install: "npm install ghost-env",
    features: [
      "In-process HTTP server + fetch shim",
      "SQLite store with reset hooks",
      "Call history and assertions for stubs",
      "TypeScript and Python SDKs",
    ],
    to: "/ghost-env",
    cta: "Read the docs",
  },
];

const stats = [
  { value: "6K+", label: "Weekly installs" },
  { value: "4", label: "Products live" },
  { value: "MIT", label: "Licensed" },
];

function LandingPage() {
  usePageMeta({
    title: "slaps.dev | Open-source AI tools and building blocks",
    description:
      "Production-ready open-source projects for teams building AI copilots, autonomous agents, and interactive UI runtimes.",
  });

  return (
    <div className="landing">
      <section className="hero">
        <p className="eyebrow">Open-source AI building blocks</p>
        <h1>
          Production-ready tools
          <br />
          for AI-powered apps.
        </h1>
        <p className="lede">
          Drop-in open-source projects for teams building AI copilots,
          autonomous agents, and interactive documentation. Install, configure,
          ship.
        </p>
        <div className="hero-actions">
          <Link to="/react-exe" className="btn-primary">
            Get started <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com/vgulerianb/slapify"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="stats-row">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="section" id="products">
        <p className="eyebrow">Products</p>
        <h2>Ship faster with less boilerplate</h2>
        <p>
          Each project is self-contained, well-tested, and designed to drop
          straight into production. Install from npm, wire up, and go.
        </p>

        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p.name}>
              <span className="pill">{p.pill}</span>
              <h3>{p.name}</h3>
              <p className="card-desc">{p.description}</p>
              <code className="card-install">{p.install}</code>
              <ul className="card-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link to={p.to} className="card-link">
                {p.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div className="coming-soon">
          <p>
            <strong>More in the pipeline.</strong> We're also building toward
            RAG tooling, AI-native documentation, and model evaluation—on top of
            the projects above.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="cta-banner">
          <div>
            <h2>
              Follow us on{" "}
              <a
                href="https://www.linkedin.com/company/slaps-dev"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </h2>
            <p>New product drops, release notes, and community highlights.</p>
          </div>
          <a
            href="https://www.linkedin.com/company/slaps-dev"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Follow <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
