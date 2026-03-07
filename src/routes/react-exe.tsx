import { createFileRoute } from "@tanstack/react-router";
import ReactExePage from "../pages/ReactExePage";

export const Route = createFileRoute("/react-exe")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "React-EXE | Execute React components from strings" },
      {
        name: "description",
        content:
          "React-EXE lets you execute React components from code strings at runtime with full TypeScript support, Tailwind CSS, and external CDN resolution.",
      },
      { property: "og:title", content: "React-EXE | Execute React components from strings" },
    ],
  }),
  component: ReactExePage,
});
