import { createFileRoute } from "@tanstack/react-router";
import GhostEnvPage from "../pages/GhostEnvPage";

export const Route = createFileRoute("/stubfetch")({
  head: () => ({
    meta: [
      { title: "stubfetch | Deterministic fake HTTP APIs for testing" },
      {
        name: "description",
        content:
          "stubfetch intercepts fetch and returns deterministic in-process responses. Presets for GitHub, Stripe, OpenAI, Anthropic, S3, Slack — test without live APIs.",
      },
      { property: "og:title", content: "stubfetch | Deterministic fake HTTP APIs for testing" },
    ],
  }),
  component: GhostEnvPage,
});
