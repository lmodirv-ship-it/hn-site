import { useMemo, useState } from "react";
import { Mail, MessageCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/components/portal/ui";

const WHATSAPP = "212600000000";
const EMAIL = "info@hnchat.net";

const projectTypes = [
  { key: "Landing Page", min: 290, max: 590 },
  { key: "Web App", min: 890, max: 1900 },
  { key: "SaaS", min: 1900, max: 4500 },
  { key: "E-Commerce", min: 1200, max: 3200 },
] as const;

type Choice = "yes" | "no";

export function Estimator() {
  const [type, setType] = useState<(typeof projectTypes)[number]["key"]>("Web App");
  const [database, setDatabase] = useState<Choice>("yes");
  const [domain, setDomain] = useState<Choice>("yes");

  const price = useMemo(() => {
    const base = projectTypes.find((p) => p.key === type)!;
    let min = base.min;
    let max = base.max;
    if (database === "yes") {
      min += 250;
      max += 700;
    }
    if (domain === "yes") {
      min += 60;
      max += 120;
    }
    return { min, max };
  }, [type, database, domain]);

  const summary = `Hello HN Group, I would like a quote.
Project type: ${type}
Database: ${database === "yes" ? "Yes" : "No"}
Custom domain: ${domain === "yes" ? "Yes" : "No"}
Estimated range: $${price.min} – $${price.max}`;

  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(summary)}`;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
    "Project request — " + type,
  )}&body=${encodeURIComponent(summary)}`;

  const Option = ({
    selected,
    onClick,
    children,
  }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl px-4 py-3 text-sm transition-all ${
        selected
          ? "bg-primary text-primary-foreground glow-primary"
          : "glass text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  return (
    <section id="estimator" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-cyan">Price estimator</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Get your range in 3 clicks
          </h2>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <fieldset>
              <legend className="text-sm font-medium">1. Type of project</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {projectTypes.map((p) => (
                  <Option key={p.key} selected={type === p.key} onClick={() => setType(p.key)}>
                    {p.key}
                  </Option>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className="text-sm font-medium">2. Database needed?</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-xs">
                {(["yes", "no"] as Choice[]).map((c) => (
                  <Option key={c} selected={database === c} onClick={() => setDatabase(c)}>
                    {c === "yes" ? "Yes" : "No"}
                  </Option>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className="text-sm font-medium">3. Custom domain included?</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-xs">
                {(["yes", "no"] as Choice[]).map((c) => (
                  <Option key={c} selected={domain === c} onClick={() => setDomain(c)}>
                    {c === "yes" ? "Yes" : "No"}
                  </Option>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="glass-strong glow-primary flex flex-col justify-between rounded-2xl p-6 sm:p-8">
            <div>
              <Calculator className="size-6 text-cyan" aria-hidden />
              <p className="mt-4 text-sm text-muted-foreground">Estimated investment</p>
              <p aria-live="polite" className="mt-1 font-display text-4xl font-bold text-gradient">
                {formatMoney(price.min)} – {formatMoney(price.max)}
              </p>
              <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                <li>{type}</li>
                <li>Database: {database === "yes" ? "included" : "not included"}</li>
                <li>Custom domain: {domain === "yes" ? "included" : "not included"}</li>
              </ul>
            </div>
            <div className="mt-8 grid gap-2">
              <Button asChild variant="hero" size="lg">
                <a href={waHref} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  Send order via WhatsApp
                </a>
              </Button>
              <Button asChild variant="ghostGlow" size="lg">
                <a href={mailHref}>
                  <Mail className="size-4" aria-hidden />
                  Send order via Email
                </a>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
