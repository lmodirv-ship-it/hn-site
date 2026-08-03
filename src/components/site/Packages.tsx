import { Check, Minus, Rocket, Layers, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";

const packages = [
  {
    name: "Express Launch",
    icon: Rocket,
    audience: "Startups & MVPs",
    price: "from $390",
    highlight: false,
    features: ["24–48h delivery", "Custom domain setup", "UI/UX design", "Responsive build"],
  },
  {
    name: "Full-Stack Pro",
    icon: Layers,
    audience: "Growing businesses",
    price: "from $1,290",
    highlight: true,
    features: [
      "Database & auth (Supabase)",
      "API integrations",
      "Payment setup",
      "1 month of support",
    ],
  },
  {
    name: "Managed Subscription",
    icon: Repeat,
    audience: "Teams that keep shipping",
    price: "from $190/mo",
    highlight: false,
    features: ["Monthly hosting", "AI maintenance", "Weekly updates", "Priority response"],
  },
];

const matrix: { label: string; values: (boolean | string)[] }[] = [
  { label: "Delivery time", values: ["24–48h", "5–10 days", "Continuous"] },
  { label: "Custom domain", values: [true, true, true] },
  { label: "Database & auth", values: [false, true, true] },
  { label: "Payments", values: [false, true, true] },
  { label: "Hosting managed", values: [false, "1 month", true] },
  { label: "Weekly updates", values: [false, false, true] },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-4 text-cyan" aria-label="Included" />;
  if (value === false)
    return <Minus className="mx-auto size-4 text-muted-foreground" aria-label="Not included" />;
  return <span className="text-sm">{value}</span>;
}

export function Packages() {
  return (
    <section id="packages" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-cyan">Services & packages</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Pick the speed you need
          </h2>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {packages.map((p) => (
            <article
              key={p.name}
              className={`card-hover relative rounded-2xl p-6 ${
                p.highlight ? "glass-strong glow-primary" : "glass"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <p.icon className="size-6 text-cyan" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.audience}</p>
              <p className="mt-4 font-display text-3xl font-bold text-gradient">{p.price}</p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.highlight ? "hero" : "ghostGlow"}
                className="mt-6 w-full"
              >
                <a href="#contact">Start with {p.name}</a>
              </Button>
            </article>
          ))}
        </div>

        <div className="glass mt-10 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] border-collapse text-center">
            <caption className="sr-only">Package feature comparison</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="p-4 text-left text-sm font-medium text-muted-foreground">
                  Feature
                </th>
                {packages.map((p) => (
                  <th key={p.name} scope="col" className="p-4 text-sm font-semibold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <th scope="row" className="p-4 text-left text-sm font-normal text-muted-foreground">
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td key={i} className="p-4">
                      <Cell value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
