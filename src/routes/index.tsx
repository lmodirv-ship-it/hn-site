import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Portfolio } from "@/components/site/Portfolio";
import { Packages } from "@/components/site/Packages";
import { Estimator } from "@/components/site/Estimator";
import { Consulting } from "@/components/site/Consulting";
import { Contact, WhatsAppFab } from "@/components/site/Contact";
import { Button } from "@/components/ui/button";

const title = "HN Group — Launch Your Digital Product in Hours, Not Months";
const description =
  "AI-powered web agency. 200+ production web apps and custom domains deployed. Express launches in 24–48h, full-stack builds, hosting and prompt engineering consulting.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function CaseStudyBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16" aria-labelledby="case-studies-heading">
      <div className="glass-strong grid gap-6 rounded-2xl p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs text-cyan">
            <BookOpen className="size-3.5" aria-hidden />
            Case studies & blog
          </span>
          <h2 id="case-studies-heading" className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Read the full story behind our <span className="text-gradient">200+ builds</span>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Business problem, AI-assisted solution, feature set, tech stack and measurable impact —
            with live previews of each deployed domain.
          </p>
        </div>
        <Button asChild variant="hero" size="xl">
          <Link to="/case-studies">
            Browse case studies
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Portfolio />
        <CaseStudyBanner />
        <Packages />
        <Estimator />
        <Consulting />
      </main>
      <Contact />
      <WhatsAppFab />
    </div>
  );
}
