import { createFileRoute } from "@tanstack/react-router";
import SlapifyPage from "../pages/SlapifyPage";

export const Route = createFileRoute("/slapify")({
  head: () => ({
    meta: [
      { title: "Slapify | AI-powered browser automation" },
      {
        name: "description",
        content:
          "Slapify is an AI-powered browser automation tool that lets you run complex web tasks with natural language. Task mode and flow mode for CI pipelines.",
      },
      { property: "og:title", content: "Slapify | AI-powered browser automation" },
    ],
  }),
  component: SlapifyPage,
});
