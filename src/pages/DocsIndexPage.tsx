import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { DOC_PRODUCT_LIST, DOC_PRODUCTS, DOC_NAV } from "../documentation/docRegistry";
import { usePageMeta } from "../hooks/usePageMeta";

export default function DocsIndexPage() {
  usePageMeta({
    title: "Documentation | slaps.dev",
    description: "Documentation for react-exe, Slapify, agentpad, and stubfetch.",
  });

  return (
    <div className="docs-index-page">
      <div className="docs-index-hero">
        <p className="eyebrow">Documentation</p>
        <h1>Everything you need</h1>
        <p className="lede">
          Reference guides, API docs, and examples for all slaps.dev open-source packages.
        </p>
      </div>

      <div className="docs-index-grid">
        {DOC_PRODUCT_LIST.map((id) => {
          const meta = DOC_PRODUCTS[id];
          const nav = DOC_NAV[id];
          return (
            <div key={id} className="docs-index-card">
              <div className="docs-index-card__header">
                <h2>{meta.title}</h2>
                <p>{meta.tagline}</p>
              </div>
              <ul className="docs-index-card__links">
                {nav.map((item) => (
                  <li key={item.slug || "overview"}>
                    {item.slug ? (
                      <Link to="/docs/$product/$slug" params={{ product: id, slug: item.slug }}>
                        {item.label}
                      </Link>
                    ) : (
                      <Link to="/docs/$product" params={{ product: id }}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="docs-index-card__footer">
                <Link to="/docs/$product" params={{ product: id }} className="docs-index-card__cta">
                  Open docs <ArrowRight size={14} />
                </Link>
                <a
                  href={`https://www.npmjs.com/package/${meta.npm}`}
                  target="_blank"
                  rel="noreferrer"
                  className="docs-index-card__npm"
                >
                  npm → {meta.npm}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
