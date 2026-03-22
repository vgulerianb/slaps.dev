import { createFileRoute } from "@tanstack/react-router";
import ExecpadPage from "../pages/ExecpadPage";

export const Route = createFileRoute("/execpad")({
  head: () => ({
    meta: [
      { title: "execpad | Multi-language code execution for AI agents" },
      {
        name: "description",
        content:
          "execpad lets AI agents execute Python, JavaScript, Bash, and more in isolated sandboxes with package management and workspace modes.",
      },
      { property: "og:title", content: "execpad | Multi-language code execution for AI agents" },
    ],
  }),
  component: ExecpadPage,
});
