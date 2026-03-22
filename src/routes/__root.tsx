import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import SiteLayout from "../components/SiteLayout";
import "../styles/site.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "slaps.dev | Open-source AI tools and building blocks" },
      {
        name: "description",
        content:
          "Open-source AI building blocks for developers — react-exe, Slapify, execpad, ghost-env. Install from npm and ship faster.",
      },
      { property: "og:title", content: "slaps.dev | Open-source AI tools and building blocks" },
      {
        property: "og:description",
        content: "Open-source AI building blocks for developers — react-exe, Slapify, execpad, ghost-env.",
      },
      { property: "og:image", content: "https://slaps.dev/og/slaps.dev.png" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://slaps.dev" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "slaps.dev | Open-source AI tools and building blocks" },
      {
        name: "twitter:description",
        content: "Open-source AI building blocks for developers — react-exe, Slapify, execpad, ghost-env.",
      },
      { name: "twitter:image", content: "https://slaps.dev/og/slaps.dev.png" },
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    scripts: [
      { src: "https://cdn.tailwindcss.com" },
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-7XBDWLBGQ8",
        async: true,
      },
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-7XBDWLBGQ8');`,
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
    </RootDocument>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "4rem 2.5rem", textAlign: "center" }}>
      <h1 style={{ marginBottom: "1rem" }}>Page not found</h1>
      <Link to="/">← Home</Link>
    </div>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
