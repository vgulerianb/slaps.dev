import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../pages/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "slaps.dev | Open-source AI tools and building blocks" },
      {
        name: "description",
        content:
          "Open-source AI building blocks for developers — react-exe, Slapify, agentpad, stubfetch. Install from npm and ship faster.",
      },
    ],
  }),
  component: LandingPage,
});
