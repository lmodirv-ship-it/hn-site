import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { listCaseStudies } from "@/lib/case-studies.functions";
import { Button } from "@/components/ui/button";

const title = "Case Studies & Blog — 200+ apps built by HN Group";
const description =
  "Deep dives into the web apps, stores and AI tools HN Group has designed, built and deployed with custom domains.";

export const Route = createFileRoute("/case-studies/")({
  loader: () => listCaseStudies(),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseStudiesIndex,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center">
      <h1 className="font-display text-2xl font-bold">Case studies are unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
    </div>
  ),
});

function CaseStudiesIndex() {
  const studies = Route.useLoaderData();

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
        <header className="mt-6 max-w-2xl">
          <p className="text-sm font-medium text-cyan">Case studies & blog</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            Deep dives into what we <span className="text-gradient">shipped</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            The business problem, the AI-assisted solution, the stack and the measurable impact —
            for every project we publish.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {studies.length === 0 && (
            <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
              No case studies published yet.
            </p>
          )}
          {studies.map((s) => (
            <article key={s.id} className="glass card-hover overflow-hidden rounded-2xl">
              {s.cover_image && (
                <img
                  src={s.cover_image}
                  alt={`${s.title} preview`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              )}
              <div className="p-5">
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-cyan">
                  {s.category}
                </span>
                <h2 className="mt-3 font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.tech_stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-md bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="ghostGlow" size="sm" className="mt-5">
                  <Link to="/case-studies/$slug" params={{ slug: s.slug }}>
                    Read case study
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
