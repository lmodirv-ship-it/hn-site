import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Laptop,
  Rocket,
  Smartphone,
  Tablet,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import { getCaseStudy } from "@/lib/case-studies.functions";
import { Stars } from "./blog.index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const study = await getCaseStudy({ data: params.slug });
    if (!study) throw notFound();
    return study;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Case study unavailable — HN Group" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const t = loaderData.domain
      ? `${loaderData.title}: ${loaderData.domain} — HN Group`
      : `${loaderData.title} — HN Group`;
    const d = loaderData.summary ?? "A platform designed, built and deployed by HN Group.";
    const canonical = `https://hnsite24.online/blog/${params.slug}`;
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
                ...(loaderData.features?.length ? { featureList: loaderData.features } : {}),
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: String(loaderData.rating ?? 5),
                  bestRating: "5",
                  ratingCount: "1",
                },
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
                    name: "Blog",
                    item: "https://hnsite24.online/blog",
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
  component: BlogArticle,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center">
      <h1 className="font-display text-2xl font-bold">Case study not found</h1>
      <Button asChild variant="ghostGlow" className="mt-5">
        <Link to="/blog">Browse the network</Link>
      </Button>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center">
      <h1 className="font-display text-2xl font-bold">This case study didn&apos;t load</h1>
    </div>
  ),
});

type DeviceKey = "desktop" | "tablet" | "mobile";

const DEVICE_META: Record<DeviceKey, { label: string; icon: typeof Laptop; frame: string }> = {
  desktop: { label: "Desktop", icon: Laptop, frame: "max-w-full aspect-[16/10]" },
  tablet: { label: "Tablet", icon: Tablet, frame: "mx-auto w-full max-w-xl aspect-[4/3]" },
  mobile: { label: "Mobile", icon: Smartphone, frame: "mx-auto w-full max-w-[280px] aspect-[9/17]" },
};

function BlogArticle() {
  const study = Route.useLoaderData();
  const [device, setDevice] = useState<DeviceKey>("desktop");

  const shots: Record<DeviceKey, string | null> = {
    desktop: study.screenshot_desktop ?? study.cover_image,
    tablet: study.screenshot_tablet ?? study.cover_image,
    mobile: study.screenshot_mobile ?? study.cover_image,
  };
  const activeShot = shots[device];
  const meta = DEVICE_META[device];

  return (
    <article className="hero-aura min-h-screen pb-24">
      <div className="mx-auto max-w-4xl px-5 pt-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All network sites
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-cyan">
              {study.category}
            </span>
            {study.domain && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-surface-2 px-3 py-1 text-xs text-foreground">
                <Globe className="size-3.5 text-cyan" aria-hidden />
                {study.domain}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs">
              <Stars rating={study.rating ?? 5} />
              <span className="text-muted-foreground">{study.rating ?? 5}/5</span>
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            {study.title}
            {study.domain && <span className="block text-gradient text-2xl sm:text-3xl">{study.domain}</span>}
          </h1>
          {study.summary && <p className="mt-4 text-lg text-muted-foreground">{study.summary}</p>}

          {study.live_url && (
            <Button asChild variant="hero" className="mt-6">
              <a href={study.live_url} target="_blank" rel="noreferrer">
                Visit live website
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </Button>
          )}
        </header>

        {/* Device gallery */}
        {activeShot && (
          <section className="mt-10" aria-labelledby="gallery-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="gallery-heading" className="font-display text-xl font-semibold">
                Interface gallery
              </h2>
              <div className="glass inline-flex gap-1 rounded-full p-1">
                {(Object.keys(DEVICE_META) as DeviceKey[]).map((k) => {
                  const Icon = DEVICE_META[k].icon;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setDevice(k)}
                      aria-pressed={device === k}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
                        device === k
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      {DEVICE_META[k].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <figure className={`glass-strong mt-4 overflow-hidden rounded-2xl p-2 ${meta.frame}`}>
              <img
                src={activeShot}
                alt={`${study.title} ${meta.label.toLowerCase()} view`}
                loading="lazy"
                className="size-full rounded-xl object-cover object-top"
              />
            </figure>
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {meta.label} view — {study.domain ?? study.title}
            </figcaption>
          </section>
        )}

        {study.purpose && (
          <section className="glass mt-12 rounded-2xl p-6">
            <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <Target className="size-5 text-cyan" aria-hidden />
              Executive summary &amp; purpose
            </h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{study.purpose}</p>
          </section>
        )}

        {(study.problem || study.solution) && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {study.problem && (
              <div className="glass rounded-2xl border-l-2 border-l-destructive p-6">
                <h2 className="font-display text-lg font-semibold">The challenge</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {study.problem}
                </p>
              </div>
            )}
            {study.solution && (
              <div className="glass rounded-2xl border-l-2 border-l-primary p-6">
                <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
                  <Zap className="size-4 text-cyan" aria-hidden />
                  The HN Group solution
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {study.solution}
                </p>
              </div>
            )}
          </section>
        )}

        {study.features?.length > 0 && (
          <section className="glass mt-8 rounded-2xl p-6">
            <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <Wrench className="size-5 text-cyan" aria-hidden />
              Technical features
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {study.features.map((f: string) => (
                <li
                  key={f}
                  className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted-foreground"
                >
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {study.api_specs?.length > 0 && (
          <section className="glass mt-8 rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold">API specifications</h2>
            <ul className="mt-4 space-y-2">
              {study.api_specs.map((a: string) => (
                <li
                  key={a}
                  className="rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-muted-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {study.tech_stack?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Technology stack</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {study.tech_stack.map((t: string) => (
                <li
                  key={t}
                  className="rounded-md bg-surface-2 px-2.5 py-1 text-sm text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        {study.results && (
          <section className="glass mt-8 rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold">Impact &amp; results</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{study.results}</p>
          </section>
        )}

        <section className="glass-strong glow-primary mt-14 rounded-2xl p-8 text-center">
          <Rocket className="mx-auto size-6 text-cyan" aria-hidden />
          <h2 className="mt-4 font-display text-2xl font-bold">
            Need an enterprise-grade web application or custom infrastructure like this built for
            your company?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Request your build now on{" "}
            <a href="https://hnsite24.online" className="text-cyan underline-offset-4 hover:underline">
              hnsite24.online
            </a>{" "}
            — production-ready in 24–48 hours, custom domain included.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-6">
            <a href="https://hnsite24.online">Request your build now</a>
          </Button>
        </section>
      </div>
    </article>
  );
}
