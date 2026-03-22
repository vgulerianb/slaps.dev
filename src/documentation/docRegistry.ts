export type DocProductId = "react-exe" | "slapify" | "agentpad" | "stubfetch";

/** Old /docs/:product slugs → canonical id (301-style redirect in route loaders). */
export const LEGACY_DOC_PRODUCT_SLUGS: Record<string, DocProductId> = {
  execpad: "agentpad",
  "ghost-env": "stubfetch",
};

export const DOC_PRODUCTS: Record<
  DocProductId,
  {
    title: string;
    tagline: string;
    npm: string;
    productPath: string;
    /** Source repository (product or monorepo path). */
    github: string;
    hasPython?: boolean;
    /** PyPI project name when `hasPython` (usually same as npm). */
    pypi?: string;
  }
> = {
  "react-exe": {
    title: "react-exe",
    tagline: "Execute React components from code strings in the browser.",
    npm: "react-exe",
    productPath: "/react-exe",
    github: "https://github.com/vgulerianb/react-exe",
  },
  slapify: {
    title: "Slapify",
    tagline: "AI-powered browser automation, test flows, and performance auditing.",
    npm: "slapify",
    productPath: "/slapify",
    github: "https://github.com/vgulerianb/slapify",
  },
  agentpad: {
    title: "agentpad",
    tagline: "Multi-language execution against a real directory for agents and tooling.",
    npm: "agentpad",
    productPath: "/agentpad",
    github: "https://github.com/vgulerianb/agentpad",
    hasPython: true,
    pypi: "agentpad",
  },
  stubfetch: {
    title: "stubfetch",
    tagline: "Deterministic fake HTTP APIs for agent and integration tests.",
    npm: "stubfetch",
    productPath: "/stubfetch",
    github: "https://github.com/vgulerianb/stubfetch",
    hasPython: true,
    pypi: "stubfetch",
  },
};

/** Sidebar order; slug "" maps to README.md (overview). */
export const DOC_NAV: Record<DocProductId, { slug: string; label: string }[]> = {
  "react-exe": [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "api-reference", label: "API reference" },
  ],
  slapify: [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "task-mode", label: "Task mode" },
    { slug: "flow-mode", label: "Flow mode" },
    { slug: "api-reference", label: "API reference" },
  ],
  agentpad: [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "use-cases", label: "Use cases" },
    { slug: "configuration", label: "Configuration" },
    { slug: "api-reference", label: "API reference" },
    { slug: "security", label: "Security" },
  ],
  stubfetch: [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "use-cases", label: "Use cases" },
    { slug: "presets", label: "Presets" },
    { slug: "api-reference", label: "API reference" },
    { slug: "testing-and-chaos", label: "Testing & chaos" },
  ],
};

export const DOC_PRODUCT_LIST = Object.keys(DOC_PRODUCTS) as DocProductId[];

export function isDocProduct(id: string): id is DocProductId {
  return id in DOC_PRODUCTS;
}

/** Public doc URL segment → `site-docs/` subdirectory (package dirs in this monorepo). */
export const DOC_SITE_FS_DIR: Partial<Record<DocProductId, string>> = {
  agentpad: "execpad",
  stubfetch: "ghost-env",
};
