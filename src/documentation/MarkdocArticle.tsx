import Markdoc from "@markdoc/markdoc";
import type { ReactNode } from "react";
import React from "react";

type MarkdocArticleProps = {
  source: string;
};

/**
 * Renders Markdoc/Markdown via [@markdoc/markdoc](https://markdoc.dev/).
 */
export function MarkdocArticle({ source }: MarkdocArticleProps): ReactNode {
  const ast = Markdoc.parse(source);
  const content = Markdoc.transform(ast);
  return (
    <div className="markdoc-root">
      {Markdoc.renderers.react(content, React, {
        components: {},
      })}
    </div>
  );
}
