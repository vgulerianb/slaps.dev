/** Vite raw imports; keys are relative to this file. */
export const docSources = import.meta.glob<string>("../site-docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export function getDocSource(product: string, slug: string | undefined): string | null {
  const file =
    !slug || slug === "index" || slug === "overview" ? "README.md" : `${slug}.md`;
  const key = `../site-docs/${product}/${file}`;
  return docSources[key] ?? null;
}
