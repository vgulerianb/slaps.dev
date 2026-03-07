import { Link, Navigate, useParams } from "react-router-dom";
import { MarkdocArticle } from "../documentation/MarkdocArticle";
import {
  DOC_NAV,
  DOC_PRODUCTS,
  type DocProductId,
  isDocProduct,
} from "../documentation/docRegistry";
import { getDocSource } from "../documentation/loadDocs";

function docsPath(product: string, slug: string): string {
  return slug ? `/${product}/docs/${slug}` : `/${product}/docs`;
}

export default function DocsPage() {
  const { product, slug } = useParams<{ product: string; slug?: string }>();

  if (!product || !isDocProduct(product)) {
    return <Navigate to="/" replace />;
  }

  const meta = DOC_PRODUCTS[product as DocProductId];
  const nav = DOC_NAV[product as DocProductId];
  const raw = getDocSource(product, slug);

  if (!raw) {
    return (
      <div className="docs-page">
        <div className="docs-page__main docs-page__error">
          <h1>Not found</h1>
          <p>No page for this path.</p>
          <Link to={docsPath(product, "")}>Back to {meta.title} docs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="docs-page">
      <aside className="docs-sidebar" aria-label="Documentation sections">
        <p className="docs-sidebar__product">{meta.title}</p>
        <p className="docs-sidebar__tagline">{meta.tagline}</p>
        <nav className="docs-sidebar__nav">
          {nav.map((item) => {
            const to = docsPath(product, item.slug);
            const active = item.slug === (slug ?? "");
            return (
              <Link
                key={item.slug || "index"}
                to={to}
                className={active ? "docs-nav-link docs-nav-link--active" : "docs-nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="docs-sidebar__meta">
          <a
            href={`https://www.npmjs.com/package/${meta.npm}`}
            target="_blank"
            rel="noreferrer"
          >
            npm → {meta.npm}
          </a>
        </div>
      </aside>
      <article className="docs-page__main">
        <MarkdocArticle source={raw} />
      </article>
    </div>
  );
}
