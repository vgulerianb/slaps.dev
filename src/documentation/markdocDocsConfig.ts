import type { Config, Node, Schema } from "@markdoc/markdoc";

function isPromise(value: unknown): value is Promise<unknown> {
  return Boolean(value && typeof value === "object" && typeof (value as Promise<unknown>).then === "function");
}

function transformTagChildren(node: Node, config: Config) {
  const nodes = node.children.flatMap((child) => child.transform(config));
  if (nodes.some(isPromise)) {
    return Promise.all(nodes).then((resolved) => resolved.flat());
  }
  return nodes;
}

/**
 * Block tags `{% ts %}…{% /ts %}` and `{% py %}…{% /py %}` — only the branch matching
 * `variables.docsLang` is transformed; the other is omitted (prose, tables, fences).
 */
export const docsLangTags: Record<string, Schema> = {
  ts: {
    transform(node, config) {
      if ((config.variables?.docsLang ?? "ts") !== "ts") return [];
      return transformTagChildren(node, config);
    },
  },
  py: {
    transform(node, config) {
      if ((config.variables?.docsLang ?? "ts") !== "python") return [];
      return transformTagChildren(node, config);
    },
  },
};

export function docsMarkdocConfig(docsLang: "ts" | "python"): Config {
  return {
    tags: docsLangTags,
    variables: { docsLang },
  };
}
