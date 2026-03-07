import { ArrowRight, ArrowUpRight, Github, CreditCard, Bot, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

const presets = [
  { name: "github", icon: Github, desc: "Issues, pull requests, repos — GitHub REST API shape" },
  { name: "stripe", icon: CreditCard, desc: "Customers, charges, subscriptions" },
  { name: "openai / anthropic", icon: Bot, desc: "Chat completions and messages API" },
  { name: "postgres / s3 / slack", icon: Database, desc: "db().query(), object storage, Web API" },
];

const features = [
  {
    label: "Zero network calls",
    desc: "All responses are generated in-process from a deterministic seed — no live APIs, no flaky tests.",
  },
  {
    label: "Recording & replay",
    desc: "calls(), wasCalled(), exportRecordingJSON / Markdown / HAR. Replay canned fixtures in order.",
  },
  {
    label: "Eval scenarios",
    desc: "defineScenario + runEval let you script and score agent behaviour across repeatable test runs.",
  },
  {
    label: "Chaos injection",
    desc: "chaos: { minLatencyMs, failureRate } — inject latency and random failures to test resilience.",
  },
];

export default function GhostEnvPage() {
  usePageMeta({
    title: "ghost-env | Deterministic fake HTTP APIs for testing",
    description:
      "Swap real network calls for deterministic in-process fakes. GitHub, Stripe, OpenAI, Anthropic, S3, Slack, and Postgres — recording, replay, eval, and chaos built in.",
  });

  return (
    <div className="product-page">
      <section className="product-hero">
        <div>
          <p className="eyebrow">Testing infrastructure</p>
          <h1>ghost-env</h1>
          <p className="lede">
            Deterministic, in-process fake HTTP APIs for testing agents and
            tools. Swap real network calls for canned responses — GitHub,
            Stripe, OpenAI, S3, Slack, and more — with recording, replay,
            eval scenarios, and chaos injection built in.
          </p>
          <code className="install-cmd">npm install ghost-env</code>
          <div className="product-hero__actions">
            <a
              href="https://www.npmjs.com/package/ghost-env"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View on npm <ArrowRight size={16} />
            </a>
            <Link to="/docs/ghost-env" className="btn-secondary">
              Docs <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-value">7+</div>
              <div className="stat-label">Presets</div>
            </div>
            <div>
              <div className="stat-value">0</div>
              <div className="stat-label">Runtime deps</div>
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
            <pre><code>{`import { GhostEnv, github, stripe } from "ghost-env";

const env = new GhostEnv({
  seed: 42,
  providers: [
    github({ issues: [{ repo: "acme/api", title: "Bug" }] }),
    stripe({ customers: [{ email: "user@acme.com" }] }),
  ],
});

// Same shape as globalThis.fetch
const res = await env.fetch(
  "https://api.github.com/repos/acme/api/issues"
);
console.log(await res.json()); // [{ title: "Bug", ... }]

// Inspect calls
console.log(env.wasCalled("github")); // true`}</code></pre>
          </div>
        </div>
      </section>

      <section className="modes-section section">
        <p className="eyebrow">Presets</p>
        <h2>Drop-in API fakes</h2>
        <div className="modes-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {presets.map((p) => (
            <div className="mode-card" key={p.name}>
              <div className="mode-label">
                <p.icon size={16} />
                {p.name}
              </div>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="highlights-section section">
        <p className="eyebrow">Capabilities</p>
        <h2>Beyond basic mocking</h2>
        <div className="highlight-grid">
          {features.map((f) => (
            <article key={f.label} style={{ flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ fontWeight: 600, fontSize: "0.9375rem", margin: 0, color: "var(--text-primary)" }}>{f.label}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="cta-banner" style={{ marginBottom: "6rem" }}>
        <div>
          <h2>Ready to build?</h2>
          <p>Read the full documentation to get started with ghost-env.</p>
        </div>
        <Link to="/docs/ghost-env" className="btn-primary">
          Read the docs <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
