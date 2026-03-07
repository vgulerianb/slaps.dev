import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        concurrency: 8,
        failOnError: false,
      },
    }),
    viteReact(),
  ],
  build: {
    cssMinify: "esbuild",
  },
  define: {
    "process.env": {},
  },
});
