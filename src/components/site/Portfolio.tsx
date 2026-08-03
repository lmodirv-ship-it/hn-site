import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import saas from "@/assets/proj-saas.jpg";
import ecom from "@/assets/proj-ecom.jpg";
import enterprise from "@/assets/proj-enterprise.jpg";
import ai from "@/assets/proj-ai.jpg";
import booking from "@/assets/proj-booking.jpg";
import fintech from "@/assets/proj-fintech.jpg";

const categories = [
  "All",
  "SaaS & Tools",
  "E-Commerce",
  "Enterprise Solutions",
  "AI Prototypes",
] as const;

type Category = (typeof categories)[number];

type Project = {
  title: string;
  blurb: string;
  category: Exclude<Category, "All">;
  image: string;
  tags: string[];
};

const projects: Project[] = [
  {
    title: "Pulse Analytics",
    blurb: "Realtime product analytics with role-based dashboards.",
    category: "SaaS & Tools",
    image: saas,
    tags: ["React", "Supabase", "Tailwind", "Custom Domain"],
  },
  {
    title: "Nova Store",
    blurb: "Headless storefront with Stripe checkout and inventory sync.",
    category: "E-Commerce",
    image: ecom,
    tags: ["React", "Stripe", "Tailwind"],
  },
  {
    title: "Atlas Ops Portal",
    blurb: "Internal operations portal for a 400-seat logistics team.",
    category: "Enterprise Solutions",
    image: enterprise,
    tags: ["React", "Supabase", "RLS", "SSO"],
  },
  {
    title: "PromptDesk AI",
    blurb: "Multi-model assistant with streaming answers and memory.",
    category: "AI Prototypes",
    image: ai,
    tags: ["AI Gateway", "Edge Functions", "React"],
  },
  {
    title: "SlotFlow Booking",
    blurb: "Appointment scheduling with automated reminders.",
    category: "SaaS & Tools",
    image: booking,
    tags: ["React", "Supabase", "Custom Domain"],
  },
  {
    title: "LedgerOne",
    blurb: "Invoicing and payments cockpit for finance teams.",
    category: "Enterprise Solutions",
    image: fintech,
    tags: ["React", "Payments", "Tailwind"],
  },
];

export function Portfolio() {
  const [active, setActive] = useState<Category>("All");
  const visible = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="portfolio" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-cyan">Live portfolio</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Shipped work, not mockups
          </h2>
          <p className="mt-3 text-muted-foreground">
            A slice of the 200+ applications we have built, deployed and connected to custom domains
            for founders and enterprises.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Portfolio categories"
          className="mt-8 flex flex-wrap gap-2"
        >
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
                active === c
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <article
              key={p.title}
              className="glass card-hover animate-rise group overflow-hidden rounded-2xl"
            >
              <div className="relative overflow-hidden">
                <img
                  src={p.image}
                  alt={`${p.title} interface preview`}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 grid place-items-center bg-background/70 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <Button variant="hero" size="sm" aria-label={`Live preview of ${p.title}`}>
                    Live preview
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-md bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
