export type DocProductId = "runmix" | "ghost-env";

export const DOC_PRODUCTS: Record<
  DocProductId,
  { title: string; tagline: string; npm: string; githubHint?: string }
> = {
  runmix: {
    title: "runmix",
    tagline: "Multi-language execution against a real directory for agents and tooling.",
    npm: "runmix",
  },
  "ghost-env": {
    title: "ghost-env",
    tagline: "Deterministic fake HTTP APIs for agent and integration tests.",
    npm: "ghost-env",
  },
};

/** Sidebar order; slug "" maps to README.md (overview). */
export const DOC_NAV: Record<DocProductId, { slug: string; label: string }[]> = {
  runmix: [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "configuration", label: "Configuration" },
    { slug: "api-reference", label: "API reference" },
    { slug: "security", label: "Security" },
    { slug: "python", label: "Python" },
  ],
  "ghost-env": [
    { slug: "", label: "Overview" },
    { slug: "getting-started", label: "Getting started" },
    { slug: "presets", label: "Presets" },
    { slug: "api-reference", label: "API reference" },
    { slug: "testing-and-chaos", label: "Testing & chaos" },
    { slug: "python", label: "Python" },
  ],
};

export function isDocProduct(id: string): id is DocProductId {
  return id === "runmix" || id === "ghost-env";
}
