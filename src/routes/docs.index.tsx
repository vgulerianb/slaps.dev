import { createFileRoute } from "@tanstack/react-router";
import DocsIndexPage from "../pages/DocsIndexPage";

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "Documentation | slaps.dev" },
      {
        name: "description",
        content:
          "Documentation for react-exe, Slapify, agentpad, and stubfetch — reference guides, API docs, and examples.",
      },
      { property: "og:title", content: "Documentation | slaps.dev" },
    ],
  }),
  component: DocsIndexPage,
});
