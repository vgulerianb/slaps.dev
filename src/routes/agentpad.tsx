import { createFileRoute } from "@tanstack/react-router";
import ExecpadPage from "../pages/ExecpadPage";

export const Route = createFileRoute("/agentpad")({
  head: () => ({
    meta: [
      { title: "agentpad | Multi-language code execution for AI agents" },
      {
        name: "description",
        content:
          "agentpad lets AI agents execute Python, JavaScript, Bash, and more against a real project directory with overlay mode, allowlists, and structured output.",
      },
      { property: "og:title", content: "agentpad | Multi-language code execution for AI agents" },
    ],
  }),
  component: ExecpadPage,
});
