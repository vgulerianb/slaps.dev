import { createFileRoute, redirect } from "@tanstack/react-router";
import BlogPostPage from "../pages/BlogPostPage";
import { getPost } from "../blog/posts";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    if (!getPost(params.slug)) throw redirect({ to: "/blog", replace: true });
  },
  head: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) return {};
    const title = `${post.h1} | slaps.dev blog`;
    return {
      meta: [
        { title },
        { name: "description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: post.description },
        { property: "og:image", content: `https://slaps.dev${post.image}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://slaps.dev/blog/${post.slug}` }],
    };
  },
  component: BlogPostPage,
});
