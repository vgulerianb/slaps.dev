import { createFileRoute } from "@tanstack/react-router";
import SlapifyPage from "../pages/SlapifyPage";

export const Route = createFileRoute("/slapify")({
  head: () => ({
    meta: [
      { title: "Slapify | A fully autonomous browser agent" },
      {
        name: "description",
        content:
          "Give Slapify a goal in plain English and it browses, logs in, fills forms, handles files and tabs, and keeps going until it is done. Runs on your Claude or ChatGPT plan, or any API.",
      },
      { property: "og:title", content: "Slapify | A fully autonomous browser agent" },
    ],
  }),
  component: SlapifyPage,
});
