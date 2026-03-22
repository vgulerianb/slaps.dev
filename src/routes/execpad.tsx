import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/execpad")({
  beforeLoad: () => {
    throw redirect({ to: "/agentpad", replace: true });
  },
});
