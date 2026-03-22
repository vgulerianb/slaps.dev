import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ghost-env")({
  beforeLoad: () => {
    throw redirect({ to: "/stubfetch", replace: true });
  },
});
