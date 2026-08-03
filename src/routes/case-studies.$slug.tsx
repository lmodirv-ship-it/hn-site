import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Rocket } from "lucide-react";
import { getCaseStudy } from "@/lib/case-studies.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: async ({ params }) => {
    const study = await getCaseStudy({ data: params.slug });
    if (!study) throw notFound();
    return study;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Case study unavailable — HN Group" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.title} — HN Group case study`;
    const d = loaderData.summary ?? "A project designed, built and deployed by HN Group.";
    const canonical = `https://hn-site.lovable.app/case-studies/${params.slug}`;
    const image =
      typeof loaderData.cover_image === "string" && loaderData.cover_image.startsWith("https://")
        ? loaderData.cover_image
        : null;

    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: loaderData.title,
                applicationCategory: "WebApplication",
                operatingSystem: "Web",
                description: d,
                url: loaderData.live_url ?? canonical,
                ...(image ? { image } : {}),
                ...(Array.isArray(loaderData.features) && loaderData.features.length > 0
                  ? { featureList: loaderData.features }
                  : {}),
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                author: {
                  "@type": "Organization",
                  name: "HN Group",
                  url: "https://www.hn-groupe.org",
                },
              },
              {
                "@type": "Article",
                headline: t,
                description: d,
                ...(image ? { image } : {}),
                datePublished: loaderData.created_at,
                dateModified: loaderData.updated_at ?? loaderData.created_at,
                mainEntityOfPage: canonical,
                author: { "@type": "Organization", name: "HN Group" },
                publisher: {
                  "@type": "Organization",
                  name: "HN Group",
                  url: "https://www.hn-groupe.org",
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Case studies",
                    item: "https://hn-site.lovable.app/case-studies",
                  },
                  { "@type": "ListItem", position: 2, name: loaderData.title, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: CaseStudyPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center">
      <h1 className="font-display text-2xl font-bold">Case study not found</h1>
      <Button asChild variant="ghostGlow" className="mt-5">
        <Link to="/case-studies">Browse all case studies</Link>
      </Button>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center">
      <h1 className="font-display text-2xl font-bold">This case study didn&apos;t load</h1>
    </div>
  ),
});

function CaseStudyPage() {
  const study = Route.useLoaderData();
  const gallery = study.gallery ?? [];
  const [active, setActive] = useState(0);
  const heroImage = gallery[active] ?? study.cover_image;

  return (
    <article className="hero-aura min-h-screen pb-24">
      <div className="mx-auto max-w-4xl px-5 pt-16">
        <Link
          to="/case-studies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All case studies
        </Link>

        <header className="mt-6">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-cyan">
            {study.category}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{study.title}</h1>
          {study.client_name && (
            <p className="mt-2 text-muted-foreground">Client: {study.client_name}</p>
          )}
          {study.live_url && (
            <Button asChild variant="hero" className="mt-5">
              <a href={study.live_url} target="_blank" rel="noreferrer">
                Visit live website
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </Button>
          )}
        </header>

        {heroImage && (
          <figure className="glass mt-10 overflow-hidden rounded-2xl">
            <img src={heroImage} alt={`${study.title} screenshot`} className="w-full" />
          </figure>
        )}

        {gallery.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {gallery.map((g: string, i: number) => (
              <button
                key={g}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View screenshot ${i + 1}`}
                aria-pressed={active === i}
                className={`size-16 overflow-hidden rounded-lg border transition-all ${
                  active === i ? "border-primary glow-primary" : "border-border opacity-70"
                }`}
              >
                <img src={g} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-8">
          <Block title="The business problem" body={study.problem} />
          <Block title="The AI-powered solution" body={study.solution} />
          <Block title="Impact & results" body={study.results} />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <ListBlock title="Key features" items={study.features ?? []} />
          <ListBlock title="Technology stack" items={study.tech_stack ?? []} />
        </div>

        {study.live_url && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold">Live preview</h2>
            <div className="glass mt-4 overflow-hidden rounded-2xl">
              <iframe
                src={study.live_url}
                title={`${study.title} live preview`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="h-[520px] w-full border-0 bg-background"
              />
            </div>
          </section>
        )}

        <section className="glass-strong glow-primary mt-14 rounded-2xl p-8 text-center">
          <Rocket className="mx-auto size-6 text-cyan" aria-hidden />
          <h2 className="mt-4 font-display text-2xl font-bold">
            Want a similar website built for your business?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We deliver production-ready apps in 24–48 hours, domain included.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-6">
            <Link to="/" hash="contact">
              Click here to launch
            </Link>
          </Button>
        </section>
      </div>
    </article>
  );
}

function Block({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-muted-foreground">{body}</p>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i} className="rounded-md bg-surface-2 px-2.5 py-1 text-sm text-muted-foreground">
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}
