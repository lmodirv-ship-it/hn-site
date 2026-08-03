import { useEffect, useRef, useState } from "react";
import { ArrowRight, Globe, Timer, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

function useCountUp(target: number, decimals = 0, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Number((target * eased).toFixed(decimals)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, decimals, duration]);

  return { ref, value };
}

function Stat({
  icon: Icon,
  target,
  decimals = 0,
  prefix = "",
  suffix,
  label,
}: {
  icon: typeof Globe;
  target: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
}) {
  const { ref, value } = useCountUp(target, decimals);
  return (
    <div className="glass card-hover rounded-2xl p-5">
      <Icon className="size-5 text-cyan" aria-hidden />
      <p className="mt-3 font-display text-3xl font-bold sm:text-4xl">
        <span ref={ref}>
          {prefix}
          {value.toFixed(decimals)}
        </span>
        <span className="text-gradient">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="hero-aura pointer-events-none absolute inset-0" aria-hidden />
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="animate-rise mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Zap className="size-3.5 text-cyan" aria-hidden />
            200+ production apps shipped with Lovable
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-bold sm:text-6xl lg:text-7xl">
            Launch Your Digital Product in{" "}
            <span className="text-gradient">Hours, Not Months.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Powered by AI &amp; Proven Expertise. Over 200+ Production Web Apps and Custom Domains
            Deployed.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <a href="#contact">
                Book a Demo / Project
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
            <Button asChild variant="ghostGlow" size="xl">
              <a href="#portfolio">Explore Portfolio</a>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <Stat icon={Globe} target={200} suffix="+" label="Custom domains active" />
          <Stat icon={Timer} target={48} prefix="24–" suffix="h" label="Average delivery time" />
          <Stat
            icon={ShieldCheck}
            target={99.9}
            decimals={1}
            suffix="%"
            label="Uptime & full-stack integration"
          />
        </div>
      </div>
    </section>
  );
}
