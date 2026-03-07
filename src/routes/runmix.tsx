import { createFileRoute } from "@tanstack/react-router";
import RunmixPage from "../pages/RunmixPage";

export const Route = createFileRoute("/runmix")({
  head: () => ({
    meta: [
      { title: "runmix | Multi-language code execution for AI agents" },
      {
        name: "description",
        content:
          "runmix lets AI agents execute Python, JavaScript, Bash, and more in isolated sandboxes with package management and workspace modes.",
      },
      { property: "og:title", content: "runmix | Multi-language code execution for AI agents" },
    ],
  }),
  component: RunmixPage,
});
