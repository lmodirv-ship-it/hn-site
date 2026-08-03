import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Rocket, Sparkles, Wand2, Loader2, Clock, Wallet, Layers } from "lucide-react";
import { generateProjectScope, type ProjectScope } from "@/lib/planner.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/components/portal/ui";

const title = "AI Project Planner — free scope, timeline & budget | HN Group";
const description =
  "Describe your idea and get an instant AI-generated project scope: recommended features, tech stack, delivery time and a realistic budget range — free, in seconds.";
const url = "https://hn-site.lovable.app/planner";

const EXAMPLES = [
  "I want a real estate booking app",
  "An online store for my bakery with delivery",
  "A SaaS dashboard for gym membership management",
  "An AI tool that summarises legal contracts",
];

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "AI Project Planner",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description,
          url,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "HN Group", url: "https://www.hn-groupe.org" },
        }),
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [idea, setIdea] = useState("");
  const [scope, setScope] = useState<ProjectScope | null>(null);
  const navigate = useNavigate();
  const generate = useServerFn(generateProjectScope);

  const plan = useMutation({
    mutationFn: async (value: string) => generate({ data: { idea: value } }),
    onSuccess: async (result) => {
      setScope(result);
      const { data: session } = await supabase.auth.getSession();
      await supabase.from("project_briefs").insert({
        user_id: session.session?.user.id ?? null,
        idea,
        project_title: result.project_title,
        summary: result.summary,
        features: result.features,
        tech_stack: result.tech_stack,
        timeline: result.timeline,
        budget_min: result.budget_min,
        budget_max: result.budget_max,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const launch = () => {
    if (!scope) return;
    const message = [
      `Project: ${scope.project_title}`,
      `Idea: ${idea}`,
      "",
      scope.summary,
      "",
      `Recommended package: ${scope.recommended_package}`,
      `Target delivery: ${scope.timeline}`,
      `Budget range: ${formatMoney(scope.budget_min)} – ${formatMoney(scope.budget_max)}`,
      "",
      "Key features:",
      ...scope.features.map((f) => `• ${f}`),
    ].join("\n");
    sessionStorage.setItem("hn_project_brief", message);
    navigate({ to: "/", hash: "contact" });
  };

  return (
    <div className="hero-aura min-h-screen pb-24">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-5 pt-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to site
        </Link>

        <header className="mt-6 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs text-cyan">
            <Sparkles className="size-3.5" aria-hidden />
            Free AI tool
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            AI <span className="text-gradient">Project Planner</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Type your idea in one line. Get a structured scope, feature list, recommended stack,
            delivery time and budget — instantly.
          </p>
        </header>

        <form
          className="glass-strong mt-8 rounded-2xl p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (idea.trim().length < 8) {
              toast.error("Describe your idea in a few more words.");
              return;
            }
            plan.mutate(idea.trim());
          }}
        >
          <Label htmlFor="idea">Your idea</Label>
          <Textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="I want a real estate booking app…"
            className="mt-2"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIdea(e)}
                className="rounded-full bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-cyan"
              >
                {e}
              </button>
            ))}
          </div>
          <Button type="submit" variant="hero" size="xl" className="mt-6" disabled={plan.isPending}>
            {plan.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Wand2 className="size-4" aria-hidden />
            )}
            {plan.isPending ? "Designing your scope…" : "Generate my project scope"}
          </Button>
        </form>

        {scope && (
          <section className="mt-10 grid gap-5" aria-live="polite">
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold">{scope.project_title}</h2>
              <p className="mt-3 text-muted-foreground">{scope.summary}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Stat icon={Clock} label="Estimated delivery" value={scope.timeline} />
                <Stat
                  icon={Wallet}
                  label="Budget range"
                  value={`${formatMoney(scope.budget_min)} – ${formatMoney(scope.budget_max)}`}
                />
                <Stat icon={Layers} label="Recommended package" value={scope.recommended_package} />
              </div>
            </div>

            {scope.modules.length > 0 && (
              <div className="glass rounded-2xl p-6 sm:p-8">
                <h3 className="font-display text-lg font-semibold">Project scope</h3>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scope.modules.map((m, i) => (
                    <li key={m.name} className="rounded-xl bg-surface-2 p-4">
                      <p className="text-xs text-cyan">Module {i + 1}</p>
                      <p className="mt-1 font-medium">{m.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <TagBlock title="Recommended features" items={scope.features} />
              <TagBlock title="Technology stack" items={scope.tech_stack} />
            </div>

            <div className="glass-strong glow-primary rounded-2xl p-8 text-center">
              <Rocket className="mx-auto size-6 text-cyan" aria-hidden />
              <h3 className="mt-4 font-display text-2xl font-bold">Ready when you are</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll take this scope straight into production — delivery in {scope.timeline}.
              </p>
              <Button variant="hero" size="xl" className="mt-6" onClick={launch}>
                Launch this project now
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <Icon className="size-4 text-cyan" aria-hidden />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

function TagBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i} className="rounded-md bg-surface-2 px-2.5 py-1 text-sm text-muted-foreground">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
