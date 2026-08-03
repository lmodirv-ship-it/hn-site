import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Portfolio } from "@/components/site/Portfolio";
import { Packages } from "@/components/site/Packages";
import { Estimator } from "@/components/site/Estimator";
import { Consulting } from "@/components/site/Consulting";
import { Contact, WhatsAppFab } from "@/components/site/Contact";

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

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Portfolio />
        <Packages />
        <Estimator />
        <Consulting />
      </main>
      <Contact />
      <WhatsAppFab />
    </div>
  );
}
