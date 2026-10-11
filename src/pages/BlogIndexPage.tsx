import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BLOG_POSTS, BLOG_SERIES } from "../blog/posts";
import { usePageMeta } from "../hooks/usePageMeta";

export default function BlogIndexPage() {
  usePageMeta({
    title: "Blog | slaps.dev",
    description:
      "Deep dives on the open-source tools behind slaps.dev, with real runs and real numbers. Start with the five-part series on building Slapify, an autonomous browser agent.",
  });

  return (
    <div className="blog-page blog-index">
      <header className="blog-index__head">
        <p className="eyebrow">Blog</p>
        <h1>Notes from building the tools</h1>
        <p className="blog-index__intro">
          Deep dives on the open-source tools behind slaps.dev, with real runs
          and real numbers.
        </p>
      </header>

      <section className="blog-series">
        <div className="blog-series__text">
          <p className="blog-kicker">Slapify · {BLOG_SERIES.kicker}</p>
          <h2>{BLOG_SERIES.h1}</h2>
          <p>{BLOG_SERIES.intro}</p>
          <Link to="/blog/$slug" params={{ slug: BLOG_POSTS[0].slug }} className="btn-primary">
            Start with part 1 <ArrowRight size={16} />
          </Link>
        </div>
        <figure className="blog-series__media">
          <img
            src="/slapify/store-run.gif"
            alt="Slapify shopping a demo store: it opens a jacket, rejects it on price, picks a cheaper waterproof one, selects size M, ticks gift wrap and adds it to the cart."
            width={960}
            height={600}
          />
          <figcaption>A real run on a demo store, 79 seconds end to end.</figcaption>
        </figure>
      </section>

      <div className="stats blog-index__stats">
        {BLOG_SERIES.stats.map(([value, label]) => (
          <div className="stat" key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <section className="blog-index__list">
        <p className="eyebrow">The series</p>
        <div className="blog-cards">
          {BLOG_POSTS.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="blog-card">
              <img src={p.image} alt="" loading="lazy" width={1280} height={720} />
              <div className="blog-card__body">
                <p className="blog-kicker">{p.tag}</p>
                <h3>{p.cardTitle}</h3>
                <p>{p.cardText}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="blog-index__foot">{BLOG_SERIES.foot}</p>
      </section>
    </div>
  );
}
