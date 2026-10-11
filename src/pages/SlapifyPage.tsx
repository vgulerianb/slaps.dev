import {
  ArrowRight,
  ArrowUpRight,
  Workflow,
  Bot,
  Code,
  BookOpen,
  MousePointerClick,
  FolderOpen,
  KeyRound,
  Eye,
  ShieldCheck,
  Clock,
  Video,
  Gamepad2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DOC_PRODUCTS } from "../documentation/docRegistry";
import { usePageMeta } from "../hooks/usePageMeta";
import { compactNumber, useNpmStats } from "../hooks/useNpmStats";

const slapifyMeta = DOC_PRODUCTS.slapify;

/** Shown until npm answers (and in the prerendered HTML). */
const FALLBACK_VERSION = "0.0.23";

const runs = [
  {
    src: "/slapify/store-run.gif",
    title: "Shops a store",
    goal: "Go to the store. Find a waterproof jacket that costs less than $150, add it to the cart in size M with gift wrap, and tell me the cart total.",
    detail: "Searches, compares, reads the product page, picks a size from a dropdown, ticks gift wrap and adds to cart.",
  },
  {
    src: "/slapify/chirp-run.gif",
    title: "Replies to posts",
    goal: "Reply to the two posts about TypeScript with a useful tip each, and confirm each reply appears.",
    detail: "Finds the posts' real URLs with get_links, writes each reply, has it reviewed against a policy before it posts, then checks it appeared.",
  },
];

const capabilities = [
  {
    icon: BookOpen,
    title: "Reads the page",
    text: "get_page_text for posts, articles and results; get_links for real URLs, so it never guesses one.",
  },
  {
    icon: MousePointerClick,
    title: "Uses every control",
    text: "Click, type, hover, double-click, drag, checkboxes, native dropdowns, even controls hidden for keyboard users.",
  },
  {
    icon: FolderOpen,
    title: "Files and tabs",
    text: "Uploads sandboxed to one folder, downloads with sanitized names, sign-in popups and new tabs followed.",
  },
  {
    icon: KeyRound,
    title: "Logs in",
    text: "Credential profiles, cookie and session injection, and 2FA codes relayed over Telegram.",
  },
  {
    icon: Eye,
    title: "Sees when it has to",
    text: "Optional vision for CAPTCHAs, charts and canvases. Screenshots go to the model as real images.",
  },
  {
    icon: ShieldCheck,
    title: "Stays undetected",
    text: "Stealth mode patches only real automation tells, and persistent profiles keep you signed in.",
  },
  {
    icon: Clock,
    title: "Runs for days",
    text: "Persistent runs only a human can stop, schedules, memory across sessions and hard time limits.",
  },
  {
    icon: Video,
    title: "Records every run",
    text: "Annotated frames, a video, a replay.html you can scrub through, and an optional live view.",
  },
  {
    icon: Gamepad2,
    title: "Drives canvas apps",
    text: "Held keys and coordinate clicks over CDP reach canvases and cross-origin iframes, games included.",
  },
];

const providers = [
  {
    label: "Claude subscription",
    config: "provider: claude-cli",
    text: "Runs every turn through your local claude -p on a Claude Pro or Max plan. No API key.",
  },
  {
    label: "ChatGPT plan",
    config: "slapify login codex",
    text: "Sign in with ChatGPT once. Native tool calls and images through the Codex endpoint. No API key.",
  },
  {
    label: "Any API",
    config: "anthropic · openai · google · mistral · groq · ollama",
    text: "List several and Slapify falls back down the chain when one rate-limits or goes down.",
  },
];

const harness = [
  {
    label: "Tool contracts",
    desc: "Every tool declares what it can do to the world, from reading a page to buying something. Clicks are judged by the element they hit.",
  },
  {
    label: "Admission, not loop guards",
    desc: "Repeats are never blocked. Repeated failures get guidance, and a post that already went through is held instead of sent twice.",
  },
  {
    label: "Action review",
    desc: "Irreversible actions are checked against your plain-English policy first, and held when no reviewer can answer.",
  },
  {
    label: "Recovery",
    desc: "Transient failures retry, outages and usage limits are waited out, and one bad step never ends a run.",
  },
  {
    label: "Compaction",
    desc: "Long histories are summarised without ever paraphrasing the goal, so a week-long run keeps its instructions.",
  },
  {
    label: "Fast decisions",
    desc: "Optional Jev or OpenAI Decisions answer \"which element?\" and \"is this true?\" in under a second, with the LLM as fallback.",
  },
];

const modes = [
  {
    icon: Bot,
    label: "Task mode",
    description:
      "Give it a goal in plain English. The agent plans, browses, logs in, recovers from errors and keeps going until the job is done, even if that takes days.",
    features: [
      "slapify task \"…\" for any goal",
      "slapify fast for click-and-fill goals",
      "Schedules, sessions and memory",
    ],
  },
  {
    icon: Workflow,
    label: "Run mode",
    description:
      "Executes .flow files: test scripts that describe user journeys step by step in plain English. Think Playwright, written like a checklist.",
    features: [
      "English-first .flow format",
      "Popups handled, verify steps checked",
      "CI/CD-friendly exit codes and reports",
    ],
  },
  {
    icon: Code,
    label: "Programmatic mode",
    description:
      "createAgent() runs the same harness as the CLI from JS or TS: inline config, streamed events and resumable sessions, plus perf audits and flows.",
    features: [
      "createAgent().run() and .stream()",
      "Config inline or from .slapify/",
      "Performance audits and flow runner",
    ],
  },
];

function SlapifyPage() {
  usePageMeta({
    title: "Slapify | A fully autonomous browser agent",
    description:
      "Give Slapify a goal in plain English and it browses, logs in, fills forms, handles files and tabs, and keeps going until it is done. Runs on your Claude or ChatGPT plan, or any API.",
  });
  // Live from npm on every visit; the prerendered HTML shows the fallbacks.
  const npm = useNpmStats(slapifyMeta.npm, FALLBACK_VERSION);

  const heroStats = [
    { value: npm.version, label: "Latest version" },
    { value: npm.weeklyDownloads === null ? "—" : compactNumber(npm.weeklyDownloads), label: "Weekly downloads" },
    { value: "3", label: "Modes" },
  ];

  return (
    <div className="slapify-page">
      <section className="product-hero">
        <div>
          <p className="eyebrow">Autonomous browser agent</p>
          <h1>Slapify</h1>
          <p className="lede">
            Give it a goal in plain English and it does what a person at a
            keyboard would: reads pages, clicks, types, logs in, fills forms,
            handles files and tabs, and keeps going until the job is done.
          </p>
          <code className="install-cmd">npx slapify init</code>
          <div className="product-hero__actions">
            <a
              href={`https://www.npmjs.com/package/${slapifyMeta.npm}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View on npm <ArrowRight size={16} />
            </a>
            <a
              href={slapifyMeta.github}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
            <Link
              to="/docs/$product"
              params={{ product: "slapify" }}
              className="btn-secondary"
            >
              Docs <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-stats" aria-live="polite">
            {heroStats.map((s) => (
              <div key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="slapify-hero-media">
          <img
            src="/terminal-slapify.gif"
            alt="Slapify running an autonomous task in the terminal"
            width={900}
            height={858}
          />
        </div>
      </section>

      <section className="section slapify-section">
        <p className="eyebrow">Watch it work</p>
        <h2>Real runs, recorded by Slapify itself</h2>
        <p className="slapify-section__lede">
          Every run can be recorded: one annotated frame per step, a video and a
          replay you can scrub through. These two ran on demo sites.
        </p>
        <div className="slapify-runs">
          {runs.map((r) => (
            <figure className="slapify-run" key={r.src}>
              <div className="slapify-run__frame">
                <div className="code-window__bar">
                  <span />
                  <span />
                  <span />
                </div>
                <img src={r.src} alt={`Recorded Slapify run: ${r.title}`} width={960} height={600} loading="lazy" />
              </div>
              <figcaption>
                <strong>{r.title}</strong>
                <code>Goal: {r.goal}</code>
                <span>{r.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section slapify-section">
        <p className="eyebrow">Capabilities</p>
        <h2>Does what a person at a keyboard does</h2>
        <div className="slapify-caps">
          {capabilities.map((c) => (
            <article key={c.title}>
              <c.icon size={18} />
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section slapify-section">
        <p className="eyebrow">Models</p>
        <h2>Runs on the plan you already pay for</h2>
        <p className="slapify-section__lede">
          Use a Claude or ChatGPT subscription instead of API credits, or any of
          six API providers with automatic fallback.
        </p>
        <div className="modes-grid">
          {providers.map((p) => (
            <div className="mode-card" key={p.label}>
              <div className="mode-label">{p.label}</div>
              <code className="slapify-chip">{p.config}</code>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="highlights-section section">
        <p className="eyebrow">The harness</p>
        <h2>Autonomy you can leave alone</h2>
        <div className="highlight-grid">
          {harness.map((h) => (
            <article key={h.label} className="slapify-harness">
              <h3>{h.label}</h3>
              <p>{h.desc}</p>
            </article>
          ))}
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

      <section className="section slapify-section">
        <p className="eyebrow">Quick start</p>
        <h2>Up and running in a minute</h2>
        <div className="slapify-quickstart">
          <div className="code-window">
            <div className="code-window__bar">
              <span />
              <span />
              <span />
            </div>
            <pre>
              <code>{`# Set up: pick an API key, or your Claude or ChatGPT plan
npx slapify init

# Give it a goal (and keep a replay of the run)
npx slapify task "Find a waterproof jacket under $150
  and add it to the cart in size M" --record runs/jacket

# Plain-English E2E tests
npx slapify run tests/checkout.flow --report`}</code>
            </pre>
          </div>
          <div className="code-window">
            <div className="code-window__bar">
              <span />
              <span />
              <span />
            </div>
            <pre>
              <code>{`import { createAgent } from "slapify";

const agent = createAgent({ stealth: true });

const run = await agent.run(
  "Check the status of my last three orders on example-shop.com"
);
console.log(run.finalSummary);

for await (const e of agent.stream("Summarise my unread email")) {
  if (e.type === "status_update") console.log(e.message);
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <div className="cta-banner slapify-cta">
        <div>
          <h2>Give it a goal</h2>
          <p>Install with npx, pick a model, and watch it work.</p>
        </div>
        <div className="product-hero__actions">
          <Link to="/docs/$product" params={{ product: "slapify" }} className="btn-primary">
            Read the docs <ArrowRight size={16} />
          </Link>
          <a href={slapifyMeta.github} target="_blank" rel="noreferrer" className="btn-secondary">
            GitHub <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default SlapifyPage;
