/// <reference types="vite/client" />
// Blog posts ported from the Slapify blog series. Metadata lives in
// posts.json, each post's article body in content/<slug>.html, and its
// interactive parts in public/blog/scripts/<slug>.js.
import meta from "./posts.json";
import gettingStarted from "./content/getting-started.html?raw";
import twitterAgent from "./content/building-a-twitter-agent.html?raw";
import jev from "./content/jev.html?raw";
import stealthMode from "./content/stealth-mode.html?raw";
import harness from "./content/harness.html?raw";

export interface BlogPost {
  slug: string;
  /** Short title, used for the browser tab. */
  title: string;
  description: string;
  /** "Part 1 · Getting started" */
  kicker: string;
  h1: string;
  /** May contain inline HTML (links, emphasis). */
  lede: string;
  byline: string[];
  image: string;
  tag: string;
  cardTitle: string;
  cardText: string;
  body: string;
}

const bodies: Record<string, string> = {
  "getting-started": gettingStarted,
  "building-a-twitter-agent": twitterAgent,
  jev,
  "stealth-mode": stealthMode,
  harness,
};

export const BLOG_SERIES = meta.index;

export const BLOG_POSTS: BlogPost[] = meta.posts.map((p) => ({ ...p, body: bodies[p.slug] }));

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
