import { createFileRoute, redirect } from "@tanstack/react-router";
import DocsPage from "../pages/DocsPage";
import { isDocProduct, DOC_PRODUCTS, DOC_NAV } from "../documentation/docRegistry";

export const Route = createFileRoute("/docs/$product/$slug")({
  beforeLoad: ({ params }) => {
    if (!isDocProduct(params.product)) {
      throw redirect({ to: "/docs", replace: true });
    }
  },
  head: ({ params }) => {
    if (!isDocProduct(params.product)) return {};
    const meta = DOC_PRODUCTS[params.product];
    const nav = DOC_NAV[params.product];
    const page = nav.find((n) => n.slug === params.slug);
    const title = page?.label
      ? `${page.label} — ${meta.title} | slaps.dev`
      : `${meta.title} docs | slaps.dev`;
    return {
      meta: [
        { title },
        { name: "description", content: meta.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: meta.tagline },
      ],
    };
  },
  component: DocsPage,
});
