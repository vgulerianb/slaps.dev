import { createFileRoute } from "@tanstack/react-router";
import GhostEnvPage from "../pages/GhostEnvPage";

export const Route = createFileRoute("/ghost-env")({
  head: () => ({
    meta: [
      { title: "ghost-env | Deterministic fake HTTP APIs for testing" },
      {
        name: "description",
        content:
          "ghost-env intercepts HTTP calls and injects deterministic fake responses. Preset scenarios for Stripe, OpenAI, GitHub — test without live APIs.",
      },
      { property: "og:title", content: "ghost-env | Deterministic fake HTTP APIs for testing" },
    ],
  }),
  component: GhostEnvPage,
});
