import { Brain, Users, Wand2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const offers = [
  {
    icon: Brain,
    title: "1-on-1 consulting",
    body: "Architecture reviews, prompt strategy and shipping velocity coaching for solo builders.",
  },
  {
    icon: Users,
    title: "Team training",
    body: "Hands-on workshops that turn product teams into confident AI-native developers.",
  },
  {
    icon: Wand2,
    title: "Prompt optimization",
    body: "Audit and rewrite of your prompt library for Lovable power users — fewer retries, better output.",
  },
];

export function Consulting() {
  return (
    <section id="consulting" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="hero-aura pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-sm font-medium text-cyan">Prompt engineering & consulting</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                Train your team to build at <span className="text-gradient">AI speed</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                For developers and enterprises who want the same output rate that let us ship 200+
                production applications.
              </p>
              <Button asChild variant="hero" size="lg" className="mt-7">
                <a href="#contact">
                  Book a consulting slot
                  <ArrowUpRight className="size-4" aria-hidden />
                </a>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-1">
              {offers.map((o) => (
                <div key={o.title} className="glass card-hover flex gap-4 rounded-2xl p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2">
                    <o.icon className="size-5 text-cyan" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold">{o.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
