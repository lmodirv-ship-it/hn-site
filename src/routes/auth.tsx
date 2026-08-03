import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — HN Group Client Portal" },
      {
        name: "description",
        content: "Sign in to the HN Group portal to track your projects, domains and tickets.",
      },
      { property: "og:title", content: "Sign in — HN Group Client Portal" },
      {
        property: "og:description",
        content: "Access your HN Group dashboard: orders, domains, subscriptions and tickets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value) return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const target = safePath(search.redirect);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: target, replace: true });
      } else if (mode === "signup") {
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: target, replace: true });
        } else {
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Password reset link sent.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error("Google sign-in failed.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: target, replace: true });
  };

  return (
    <div className="hero-aura relative flex min-h-screen items-center justify-center px-5 py-16">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to site
        </Link>

        <div className="glass-strong rounded-2xl p-7">
          <span className="grid size-10 place-items-center rounded-xl bg-primary glow-primary">
            <Sparkles className="size-5 text-primary-foreground" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">
            {mode === "signin"
              ? "Sign in to your portal"
              : mode === "signup"
                ? "Create your account"
                : "Reset your password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track orders, domains, subscriptions and tickets in one place.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  placeholder="Jane Doe"
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                placeholder="you@company.com"
                required
              />
            </div>
            {mode !== "forgot" && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            <Button type="submit" variant="hero" size="lg" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send link"}
            </Button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="ghostGlow"
                size="lg"
                className="w-full"
                onClick={handleGoogle}
                disabled={busy}
              >
                Continue with Google
              </Button>
            </>
          )}

          <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                <button type="button" className="hover:text-cyan" onClick={() => setMode("signup")}>
                  Create an account
                </button>
                <button type="button" className="hover:text-cyan" onClick={() => setMode("forgot")}>
                  Forgot password?
                </button>
              </>
            ) : (
              <button type="button" className="hover:text-cyan" onClick={() => setMode("signin")}>
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
