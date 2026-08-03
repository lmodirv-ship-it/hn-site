import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "#portfolio", label: "Portfolio" },
  { href: "#packages", label: "Packages" },
  { href: "#estimator", label: "Estimator" },
  { href: "#consulting", label: "Consulting" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const authLabel = user ? "Dashboard" : "Sign in";
  const authTo = user ? "/dashboard" : "/auth";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-card" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5"
      >
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary glow-primary">
            <Sparkles className="size-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="truncate font-display text-lg font-bold tracking-tight">
            HN <span className="text-gradient">Group</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/planner"
            className="rounded-lg px-3 py-2 text-sm text-cyan transition-colors hover:bg-surface"
          >
            AI Planner
          </Link>
          <Link
            to="/blog"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            Blog
          </Link>
          <Link
            to="/case-studies"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            Case Studies
          </Link>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {!loading && (
            <Button asChild variant="ghostGlow" size="sm">
              <Link to={authTo}>
                {user && <LayoutDashboard className="size-4" aria-hidden />}
                {authLabel}
              </Link>
            </Button>
          )}
          <Button asChild variant="hero" size="sm">
            <a href="#contact">Book a Demo</a>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 shrink-0 place-items-center rounded-lg glass lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="glass-strong border-t lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col p-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/planner"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-cyan hover:bg-surface"
            >
              AI Planner
            </Link>
            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              to="/case-studies"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Case Studies
            </Link>
            <Link
              to={authTo}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              {authLabel}
            </Link>
            <Button asChild variant="hero" className="mt-2">
              <a href="#contact" onClick={() => setOpen(false)}>
                Book a Demo
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
