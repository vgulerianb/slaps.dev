import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { BLOG_POSTS, getPost } from "../blog/posts";
import { usePageMeta } from "../hooks/usePageMeta";

const loaded = new Map<string, Promise<void>>();

/** Load a shared script once per page load (data.js, blog.js). */
function loadOnce(src: string): Promise<void> {
  let p = loaded.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`failed to load ${src}`));
      document.head.appendChild(s);
    });
    loaded.set(src, p);
  }
  return p;
}

export default function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const post = getPost(slug)!;
  const i = BLOG_POSTS.indexOf(post);
  const prev = BLOG_POSTS[i - 1];
  const next = BLOG_POSTS[i + 1];

  usePageMeta({ title: `${post.h1} | slaps.dev blog`, description: post.description });

  // The article HTML is prerendered; its charts, players and calculators are
  // plain scripts from the original series, run once the body is in the DOM.
  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    let cancelled = false;
    loadOnce("/blog/assets/data.js")
      .then(() => loadOnce("/blog/assets/blog.js"))
      .then(() => {
        if (cancelled) return;
        script = document.createElement("script");
        script.src = `/blog/scripts/${slug}.js`;
        document.body.appendChild(script);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      script?.remove();
    };
  }, [slug]);

  return (
    <div className="blog-page">
      <article className="blog-article">
        <Link to="/blog" className="blog-back">
          <ArrowLeft size={14} /> All posts
        </Link>
        <p className="blog-kicker">{post.kicker}</p>
        <h1>{post.h1}</h1>
        <p className="blog-lede" dangerouslySetInnerHTML={{ __html: post.lede }} />
        <div className="blog-byline">
          {post.byline.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>

        {/* key: a fresh node per post, so the previous post's script output is gone */}
        <div key={slug} className="blog-body" dangerouslySetInnerHTML={{ __html: post.body }} />

        <nav className="series-nav" aria-label="Series">
          {prev ? (
            <Link to="/blog/$slug" params={{ slug: prev.slug }}>
              <span>← Previous</span>
              {prev.cardTitle}
            </Link>
          ) : (
            <Link to="/blog">
              <span>← Back to</span>
              All posts
            </Link>
          )}
          {next ? (
            <Link to="/blog/$slug" params={{ slug: next.slug }} className="series-nav__next">
              <span>Next →</span>
              {next.cardTitle}
            </Link>
          ) : (
            <Link to="/blog" className="series-nav__next">
              <span>Back to →</span>
              All posts
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
