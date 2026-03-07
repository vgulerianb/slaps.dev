import { createFileRoute, redirect } from "@tanstack/react-router";
import DocsPage from "../pages/DocsPage";
import { isDocProduct, DOC_PRODUCTS } from "../documentation/docRegistry";

export const Route = createFileRoute("/docs/$product/")({
  beforeLoad: ({ params }) => {
    if (!isDocProduct(params.product)) {
      throw redirect({ to: "/docs", replace: true });
    }
  },
  head: ({ params }) => {
    if (!isDocProduct(params.product)) return {};
    const meta = DOC_PRODUCTS[params.product];
    return {
      meta: [
        { title: `${meta.title} docs | slaps.dev` },
        { name: "description", content: meta.tagline },
        { property: "og:title", content: `${meta.title} docs | slaps.dev` },
        { property: "og:description", content: meta.tagline },
      ],
    };
  },
  component: DocsPage,
});
