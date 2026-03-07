export type DocProductId = "react-exe" | "slapify" | "runmix" | "ghost-env";

export const DOC_PRODUCTS: Record<
  DocProductId,
  { title: string; tagline: string; npm: string; productPath: string; hasPython?: boolean }
> = {
  "react-exe": {
    title: "react-exe",
    tagline: "Execute React components from code strings in the browser.",
    npm: "react-exe",
    productPath: "/react-exe",
  },
  slapify: {
    title: "Slapify",
    tagline: "AI-powered browser automation, test flows, and performance auditing.",
    npm: "slapify",
    productPath: "/slapify",
  },
  runmix: {
    title: "runmix",
    tagline: "Multi-language execution against a real directory for agents and tooling.",
    npm: "runmix",
    productPath: "/runmix",
    hasPython: true,
  },
  "ghost-env": {
    title: "ghost-env",
    tagline: "Deterministic fake HTTP APIs for agent and integration tests.",
    npm: "ghost-env",
    productPath: "/ghost-env",
    hasPython: true,
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
  runmix: [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "configuration", label: "Configuration" },
    { slug: "api-reference", label: "API reference" },
    { slug: "security", label: "Security" },
  ],
  "ghost-env": [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "presets", label: "Presets" },
    { slug: "api-reference", label: "API reference" },
    { slug: "testing-and-chaos", label: "Testing & chaos" },
  ],
};

export const DOC_PRODUCT_LIST = Object.keys(DOC_PRODUCTS) as DocProductId[];

export function isDocProduct(id: string): id is DocProductId {
  return id in DOC_PRODUCTS;
}
