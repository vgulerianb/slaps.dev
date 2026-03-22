import { DOC_SITE_FS_DIR, type DocProductId, isDocProduct } from "./docRegistry";

/** Vite raw imports; keys are relative to this file. */
export const docSources = import.meta.glob<string>("../site-docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function siteDocsSubdir(product: string): string {
  if (isDocProduct(product)) {
    return DOC_SITE_FS_DIR[product as DocProductId] ?? product;
  }
  return product;
}

export function getDocSource(product: string, slug: string | undefined): string | null {
  const file =
    !slug || slug === "index" || slug === "overview" ? "README.md" : `${slug}.md`;
  const dir = siteDocsSubdir(product);
  const key = `../site-docs/${dir}/${file}`;
  return docSources[key] ?? null;
}
