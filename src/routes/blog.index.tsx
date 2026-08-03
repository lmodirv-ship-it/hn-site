import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Globe, Search, Star } from "lucide-react";
import { Stars } from "@/components/site/Stars";
import { listCaseStudies, type CaseStudyCard } from "@/lib/case-studies.functions";
import { Button } from "@/components/ui/button";

const title = "Blog & Case Studies — HN Group network showcase";
const description =
  "Explore every website in the HN Group network: HN-DB core infrastructure, AI tools, APIs, auth and dashboards — with ratings, tech stacks and full build breakdowns.";
const canonical = "https://hnsite24.online/blog";

const CATEGORIES = ["All", "HN-DB Core", "AI Tools", "APIs & Auth", "SaaS & Dashboards"] as const;

export const Route = createFileRoute("/blog/")({
  loader: () => listCaseStudies(),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }),
  component: BlogHub,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center">
      <h1 className="font-display text-2xl font-bold">The blog is unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
    </div>
  ),
});

function BlogHub() {
  const studies = Route.useLoaderData() as CaseStudyCard[];
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return studies.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if ((s.rating ?? 0) < minRating) return false;
      if (!q) return true;
      const haystack = [
        s.title,
        s.domain ?? "",
        s.summary ?? "",
        s.category,
        ...(s.tech_stack ?? []),
        ...(s.features ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [studies, category, query, minRating]);

  return (
    <div className="hero-aura min-h-screen pb-24">
      <div className="mx-auto max-w-6xl px-5 pt-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to site
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className="text-sm font-medium text-cyan">Network showcase</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            Blog &amp; <span className="text-gradient">Case Studies</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Every domain in the HN Group network, documented: purpose, architecture, API specs,
            challenges solved and the screenshots to prove it.
          </p>
        </header>

        {/* Controls */}
        <div className="glass mt-10 rounded-2xl p-5">
          <label className="relative block">
            <span className="sr-only">Search by domain, feature or tech stack</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search a domain, feature or tech stack…"
              className="w-full rounded-xl border border-input bg-surface-2 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Minimum rating</span>
            {[0, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(r)}
                aria-pressed={minRating === r}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors ${
                  minRating === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === 0 ? (
                  "Any"
                ) : (
                  <>
                    <Star className="size-3 fill-current" aria-hidden />
                    {r}+
                  </>
                )}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
              {results.length} site{results.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.length === 0 && (
            <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
              No sites match your filters yet.
            </p>
          )}
          {results.map((s) => (
            <article key={s.id} className="glass card-hover flex flex-col overflow-hidden rounded-2xl">
              {s.cover_image && (
                <img
                  src={s.cover_image}
                  alt={`${s.title} interface preview`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-cyan">
                    {s.category}
                  </span>
                  <Stars rating={s.rating ?? 5} />
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold">{s.title}</h2>
                {s.domain && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-cyan">
                    <Globe className="size-3.5" aria-hidden />
                    {s.domain}
                  </p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {(s.tech_stack ?? []).slice(0, 4).map((t: string) => (
                    <li
                      key={t}
                      className="rounded-md bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="ghostGlow" size="sm" className="mt-5 self-start">
                  <Link to="/blog/$slug" params={{ slug: s.slug }}>
                    Read the case study
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
