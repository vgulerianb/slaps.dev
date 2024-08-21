import {
  ArrowRight,
  ArrowUpRight,
  Workflow,
  Bot,
  Activity,
  FileText,
  Code,
} from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";

const heroStats = [
  { value: "0.0.18", label: "Latest version" },
  { value: "2K+", label: "Weekly downloads" },
  { value: "3", label: "Modes" },
];

const modes = [
  {
    icon: Bot,
    label: "Task mode",
    description:
      "Launches an autonomous AI agent that plans, navigates, and executes browser tasks end-to-end. Point it at a URL, describe the goal, and let it work.",
    features: [
      "Autonomous multi-step planning",
      "Screenshot-driven reasoning",
      "Auto-generated HTML reports",
    ],
  },
  {
    icon: Workflow,
    label: "Run mode",
    description:
      "Executes .flow files — natural-language test scripts that describe user journeys step by step. Think Playwright, but written in plain English.",
    features: [
      "English-first .flow format",
      "Sequential step execution",
      "CI/CD-friendly exit codes",
    ],
  },
  {
    icon: Code,
    label: "Programmatic mode",
    description:
      "Import Slapify as a Node.js library to run audits, interact with the browser agent, and integrate deeply into your own CI/CD tools or TypeScript applications.",
    features: [
      "TypeScript native SDK",
      "Full Playwright BrowserAgent access",
      "Customizable auditing metrics",
    ],
  },
];

const highlights = [
  {
    icon: Activity,
    text: "Built-in performance auditing with Lighthouse-style metrics on every run.",
  },
  {
    icon: FileText,
    text: "Rich HTML reports with screenshots, timing, and pass/fail status per step.",
  },
  {
    icon: Bot,
    text: "LLM-provider agnostic — bring OpenAI, Anthropic, or any compatible API.",
  },
  {
    icon: Workflow,
    text: "One CLI for both autonomous tasks and scripted test flows. No context switching.",
  },
];

function SlapifyPage() {
  usePageMeta({
    title: "Slapify | AI-powered browser automation that slaps",
    description: "Run autonomous AI browser agents, audit web performance, and write true E2E test flows in plain English.",
  });

  return (
    <div className="slapify-page">
      <section className="product-hero">
        <div>
          <p className="eyebrow">Automation</p>
          <h1>Slapify</h1>
          <p className="lede">
            AI-powered browser automation that slaps — run autonomous agents,
            audit performance, and write E2E tests in plain English.
          </p>
          <code className="install-cmd">npx slapify init</code>
          <div className="product-hero__actions">
            <a
              href="https://www.npmjs.com/package/slapify"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View on npm <ArrowRight size={16} />
            </a>
            <a
              href="https://github.com/vgulerianb/slapify"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="hero-stats">
            {heroStats.map((s) => (
              <div key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-center lg:justify-end">
          <img
            src="/terminal-slapify.gif"
            alt="Slapify CLI autonomous execution demo"
            className="rounded-2xl shadow-2xl border border-slate-200 max-w-full lg:max-w-[500px] xl:max-w-xl object-contain"
          />
        </div>
      </section>

      <section className="modes-section section">
        <p className="eyebrow">How it works</p>
        <h2>Three modes, one engine</h2>

        <div className="modes-grid">
          {modes.map((m) => (
            <div className="mode-card" key={m.label}>
              <div className="mode-label">
                <m.icon size={16} />
                {m.label}
              </div>
              <p>{m.description}</p>
              <ul>
                {m.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-8 md:gap-12 py-16 border-t border-gray-200 w-full max-w-6xl mx-auto">
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Quick start</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Up and running in seconds</h2>
          <p className="text-slate-600 max-w-2xl text-lg">
            Install globally with npm, set your LLM provider key, and launch
            your first autonomous audit or flow test.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          <div className="flex flex-col gap-2 w-full flex-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">CLI Usage</span>
            <pre className="m-0 p-5 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-sm h-full">
              <code className="text-slate-800">{`# Install
npx slapify init

# Run an autonomous browser agent
slapify task "Summarise the top posts on x.com today" --report

# Execute a .flow test suite
slapify run tests/checkout.flow --report`}</code>
            </pre>
          </div>

          <div className="flex flex-col gap-2 w-full flex-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Node.js SDK</span>
            <pre className="m-0 p-5 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-sm h-full">
              <code className="text-slate-800">{`import { runPerfAudit, BrowserAgent } from "slapify";

const browser = new BrowserAgent();
await browser.launch();
const result = await runPerfAudit("https://slaps.dev", browser);
console.log(result.scores);`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="highlights-section section">
        <p className="eyebrow">Highlights</p>
        <h2>Built for real workflows</h2>

        <div className="highlight-grid">
          {highlights.map((h, i) => (
            <article key={i}>
              <h.icon size={20} />
              <p>{h.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SlapifyPage;
