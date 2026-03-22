import { lazy, Suspense, useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { MarkdocArticle } from "../documentation/MarkdocArticle";
import {
  DOC_NAV,
  DOC_PRODUCTS,
  type DocProductId,
  isDocProduct,
} from "../documentation/docRegistry";
import { getDocSource } from "../documentation/loadDocs";

type ProductPath = "/react-exe" | "/slapify" | "/execpad" | "/ghost-env";
type LangPref = "ts" | "python";

const LANG_KEY = "slaps-docs-lang";

const ReactExeDocsPlayground = lazy(
  () => import("../documentation/ReactExeDocsPlayground").then((m) => ({ default: m.ReactExeDocsPlayground }))
);

export default function DocsPage() {
  const { product, slug } = useParams({ strict: false }) as { product?: string; slug?: string };
  const [lang, setLang] = useState<LangPref>("ts");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as LangPref | null;
    if (stored === "ts" || stored === "python") setLang(stored);
  }, []);

  function switchLang(next: LangPref) {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  }

  if (!product || !isDocProduct(product)) {
    return (
      <div className="docs-page">
        <div className="docs-page__main docs-page__error">
          <h1>Not found</h1>
          <Link to="/docs">← Documentation</Link>
        </div>
      </div>
    );
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
          <Link to="/docs/$product" params={{ product }}>Back to {meta.title} docs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="docs-page">
      <aside className="docs-sidebar" aria-label="Documentation sections">
        <p className="docs-sidebar__product">{meta.title}</p>
        <p className="docs-sidebar__tagline">{meta.tagline}</p>

        {meta.hasPython && (
          <div className="docs-lang-toggle" role="group" aria-label="Language">
            <button
              className={`docs-lang-toggle__btn${lang === "ts" ? " docs-lang-toggle__btn--active" : ""}`}
              onClick={() => switchLang("ts")}
            >
              TypeScript
            </button>
            <button
              className={`docs-lang-toggle__btn${lang === "python" ? " docs-lang-toggle__btn--active" : ""}`}
              onClick={() => switchLang("python")}
            >
              Python
            </button>
          </div>
        )}

        <nav className="docs-sidebar__nav">
          {nav.map((item) => {
            const active = item.slug === (slug ?? "");
            return item.slug ? (
              <Link
                key={item.slug}
                to="/docs/$product/$slug"
                params={{ product, slug: item.slug }}
                className={active ? "docs-nav-link docs-nav-link--active" : "docs-nav-link"}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key="index"
                to="/docs/$product"
                params={{ product }}
                className={active ? "docs-nav-link docs-nav-link--active" : "docs-nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="docs-sidebar__meta">
          <Link to={meta.productPath as ProductPath} className="docs-sidebar__product-link">
            ← {meta.title}
          </Link>
          {meta.hasPython && meta.pypi && lang === "python" ? (
            <a
              href={`https://pypi.org/project/${meta.pypi}/`}
              target="_blank"
              rel="noreferrer"
            >
              PyPI → {meta.pypi}
            </a>
          ) : (
            <a
              href={`https://www.npmjs.com/package/${meta.npm}`}
              target="_blank"
              rel="noreferrer"
            >
              npm → {meta.npm}
            </a>
          )}
        </div>
      </aside>
      <article className="docs-page__main" data-lang={meta.hasPython ? lang : undefined}>
        <MarkdocArticle
          source={raw}
          product={product}
          docsLang={meta.hasPython ? lang : "ts"}
        />
        {product === "react-exe" && (
          <Suspense fallback={<div className="docs-playground-loading">Loading playground…</div>}>
            <ReactExeDocsPlayground />
          </Suspense>
        )}
      </article>
    </div>
  );
}
