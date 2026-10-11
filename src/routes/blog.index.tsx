import { createFileRoute } from "@tanstack/react-router";
import BlogIndexPage from "../pages/BlogIndexPage";

const description =
  "Deep dives on the open-source tools behind slaps.dev, with real runs and real numbers. Start with the five-part series on building Slapify, an autonomous browser agent.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | slaps.dev" },
      { name: "description", content: description },
      { property: "og:title", content: "Blog | slaps.dev" },
      { property: "og:description", content: description },
      { property: "og:image", content: "https://slaps.dev/blog/media/store/store-10.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://slaps.dev/blog" }],
  }),
  component: BlogIndexPage,
});
