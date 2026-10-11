import { ReactExeDocsPlayground } from "../documentation/ReactExeDocsPlayground";
import {
  ArrowRight,
  ArrowUpRight,
  FileCode2,
  Package,
  AppWindow,
  Feather,
  Atom,
  Layers,
  Bug,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DOC_PRODUCTS } from "../documentation/docRegistry";
import { usePageMeta } from "../hooks/usePageMeta";
import { compactNumber, useNpmStats } from "../hooks/useNpmStats";
import { ReactExeHeroDemo } from "../components/ReactExeHeroDemo";

const reactExeMeta = DOC_PRODUCTS["react-exe"];
import "../App.css";

/** Shown until npm answers. */
const FALLBACK_VERSION = "1.1.0";

const steps = [
  {
    icon: FileCode2,
    label: "Compile",
    description:
      "TypeScript and JSX compile in the browser in about a millisecond per file. Pass one string, or a whole project as an array of files.",
    features: [
      "TypeScript + JSX, no build step",
      "Relative imports, @/ aliases, CSS and JSON",
      "Syntax errors with a code frame",
    ],
  },
  {
    icon: Package,
    label: "Resolve",
    description:
      "Imports you don't provide load from npm via esm.sh. They share your app's React, so hooks and context work across libraries.",
    features: [
      "Any npm package, no config",
      "Pin versions inline: date-fns@3",
      "Or pass your own modules",
    ],
  },
  {
    icon: AppWindow,
    label: "Render",
    description:
      "Components render in an iframe with their own DOM and styles, or inline in your page. Tailwind loads with one flag.",
    features: [
      "Isolated iframe by default",
      "Tailwind CSS on demand",
      "Runtime errors caught and reported",
    ],
  },
];

const highlights = [
  {
    icon: Feather,
    text: "About 55 KB gzipped. No Babel, no bundler config, no build step.",
  },
  {
    icon: Atom,
    text: "Works with React 18 and 19, and is safe to import in SSR frameworks.",
  },
  {
    icon: Package,
    text: "npm libraries like framer-motion, Radix and lucide-react share your app's React instance, so they just work.",
  },
  {
    icon: Layers,
    text: "Multi-file projects with relative imports, @/ aliases, CSS and JSON files, re-exports and circular imports.",
  },
  {
    icon: Bug,
    text: "Readable errors: code frames for syntax errors, an error boundary for runtime errors, and onError for your logging.",
  },
  {
    icon: Sparkles,
    text: "Built for AI-generated UI. Powers artifact rendering in TuneChat.",
  },
];

function ReactExePage() {
  usePageMeta({
    title: "React-EXE | Interactive UI Engine & Playground",
    description:
      "Render React components from code strings in the browser. npm imports resolve automatically, TypeScript compiles in milliseconds, and previews run in an isolated iframe.",
  });
  const npmStats = useNpmStats(reactExeMeta.npm, FALLBACK_VERSION);

  return (
    <div className="react-exe-page">
      {/* ── Product hero ── */}
      <section className="product-hero rx-hero">
        <div>
          <p className="eyebrow">UI Runtime</p>
          <h1>React-EXE</h1>
          <p className="lede">
            Render React components from code strings, right in the browser.
            npm imports resolve automatically, TypeScript and JSX compile in
            milliseconds, and previews run in an isolated iframe — no bundler,
            no build step.
          </p>
          <code className="install-cmd">npm install react-exe</code>
          <div className="product-hero__actions">
            <a
              href={`https://www.npmjs.com/package/${reactExeMeta.npm}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View on npm <ArrowRight size={16} />
            </a>
            <a
              href={reactExeMeta.github}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
            <Link
              to="/docs/$product"
              params={{ product: "react-exe" }}
              className="btn-secondary"
            >
              Docs <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-stats" aria-live="polite">
            <div>
              <div className="stat-value">
                {npmStats.weeklyDownloads === null
                  ? "—"
                  : compactNumber(npmStats.weeklyDownloads)}
              </div>
              <div className="stat-label">Weekly downloads</div>
            </div>
            <div>
              <div className="stat-value">TS</div>
              <div className="stat-label">TypeScript native</div>
            </div>
            <div>
              <div className="stat-value">MIT</div>
              <div className="stat-label">Licensed</div>
            </div>
            <div>
              <div className="stat-value">
                v{npmStats.version}
              </div>
              <div className="stat-label">Latest version</div>
            </div>
          </div>
        </div>

        <ReactExeHeroDemo />
      </section>

      {/* ── How it works ── */}
      <section className="modes-section section w-full max-w-[1120px] mx-auto">
        <p className="eyebrow">How it works</p>
        <h2>From string to live component</h2>

        <div className="modes-grid">
          {steps.map((step) => (
            <div className="mode-card" key={step.label}>
              <div className="mode-label">
                <step.icon size={16} />
                {step.label}
              </div>
              <p>{step.description}</p>
              <ul>
                {step.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Playground ── */}
      <section className="native-playground-section section border-t border-gray-200 w-full max-w-[1120px] mx-auto">
        <div className="section-header mb-8">
          <p className="eyebrow">Playground</p>
          <h2 className="text-3xl font-bold mb-4">Try it live</h2>
          <p className="text-gray-600 max-w-2xl">
            Edit any example and the preview re-renders as you type. Every tab
            is a plain code string passed to <code>CodeExecutor</code>.
          </p>
        </div>

        <div className="native-playground-quick w-full">
          <ReactExeDocsPlayground />
        </div>
      </section>

      {/* ── Quick start ── */}
      <section className="flex flex-col gap-8 md:gap-12 py-16 border-t border-gray-200 w-full max-w-[1120px] mx-auto">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Quick start</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Drop it into any React app</h2>
          <p className="text-slate-600 max-w-2xl text-lg">
            Install the package and pass it a code string. Missing imports load
            from npm; anything you pass in <code>dependencies</code> is used instead.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          <div className="flex flex-col gap-2 w-full flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Render a string</span>
            <pre className="m-0 p-5 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-sm h-full">
              <code className="text-slate-800">{`// npm install react-exe
import { CodeExecutor } from "react-exe";

const code = \`
import { format } from "date-fns";

export default function Today() {
  const today = format(new Date(), "PPPP");
  return <p className="text-lg">{today}</p>;
}\`;

export default function Preview() {
  return (
    <CodeExecutor
      code={code}
      config={{ enableTailwind: true }}
    />
  );
}`}</code>
            </pre>
          </div>

          <div className="flex flex-col gap-2 w-full flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Use your own components</span>
            <pre className="m-0 p-5 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto text-sm h-full">
              <code className="text-slate-800">{`import { CodeExecutor } from "react-exe";
import * as ui from "./components/ui";

const files = [
  { name: "App.tsx", content: appSource, isEntry: true },
  { name: "components/Chart.tsx", content: chartSource },
];

<CodeExecutor
  code={files}
  config={{
    // import { Button } from "@/components/ui/button"
    dependencies: { "@/components/ui/*": ui },
    onError: (error) => console.error(error),
  }}
/>`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="highlights-section section w-full max-w-[1120px] mx-auto">
        <p className="eyebrow">Highlights</p>
        <h2>Small, fast and forgiving</h2>

        <div className="highlight-grid">
          {highlights.map((highlight) => (
            <article key={highlight.text}>
              <highlight.icon size={20} />
              <p>{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ReactExePage;
