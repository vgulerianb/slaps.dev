import Markdoc from "@markdoc/markdoc";
import type { ReactNode } from "react";
import React from "react";
import { Link } from "@tanstack/react-router";
import { docsMarkdocConfig } from "./markdocDocsConfig";

type MarkdocArticleProps = {
  source: string;
  product: string;
  /** Used with `{% ts %}` / `{% py %}` in markdown; defaults to TypeScript. */
  docsLang?: "ts" | "python";
};

/** Convert relative `.md` links inside docs content to proper /docs/:product/:slug routes. */
function fixDocLinks(source: string, product: string): string {
  return source.replace(
    /\]\((?!https?:\/\/)(?!\/)([^)#\s]+?)\.md(#[^)]*)?\)/g,
    (_match, path, hash) => `](/docs/${product}/${path}${hash ?? ""})`,
  );
}

/** Custom link renderer that uses react-router Link for internal hrefs. */
function makeDocLink(_product: string) {
  return function DocLink({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
    if (href && href.startsWith("/")) {
      return (
        <Link to={href} {...(rest as object)}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  };
}

export function MarkdocArticle({ source, product, docsLang = "ts" }: MarkdocArticleProps): ReactNode {
  const processed = fixDocLinks(source, product);
  const ast = Markdoc.parse(processed);
  const content = Markdoc.transform(ast, docsMarkdocConfig(docsLang));
  return (
    <div className="markdoc-root">
      {Markdoc.renderers.react(content, React, {
        components: { a: makeDocLink(product) },
      })}
    </div>
  );
}
