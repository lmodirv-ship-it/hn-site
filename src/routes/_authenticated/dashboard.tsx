import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  Plus,
  Shield,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, PriorityBadge, formatMoney } from "@/components/portal/ui";
import { Billing } from "@/components/portal/Billing";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = useRoles(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profileName, setProfileName] = useState("");

  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const tickets = useQuery({
    queryKey: ["my-tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const profile = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile.data?.full_name) setProfileName(profile.data.full_name);
  }, [profile.data?.full_name]);

  const createOrder = useMutation({
    mutationFn: async (payload: { project_name: string; description: string }) => {
      const { error } = await supabase.from("orders").insert({
        user_id: user!.id,
        project_name: payload.project_name,
        description: payload.description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project request submitted.");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createTicket = useMutation({
    mutationFn: async (payload: {
      subject: string;
      message: string;
      order_id: string;
      priority: string;
      request_type: string;
    }) => {
      const { error } = await supabase.from("tickets").insert({
        user_id: user!.id,
        subject: payload.subject,
        message: payload.message,
        order_id: payload.order_id || null,
        priority: payload.priority,
        request_type: payload.request_type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket submitted.");
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profileName })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Profile updated."),
    onError: (e: Error) => toast.error(e.message),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const activeOrders = (orders.data ?? []).filter((o) => o.status !== "completed");
  const subscription = (orders.data ?? []).find((o) => o.subscription_plan !== "none");

  return (
    <div className="hero-aura min-h-screen pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-cyan">Client portal</p>
            <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
              {profile.data?.full_name || user?.email}
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            {isAdmin && (
              <Button asChild variant="ghostGlow" size="sm">
                <Link to="/admin">
                  <Shield className="size-4" aria-hidden />
                  Admin
                </Link>
              </Button>
            )}
            <Button variant="ghostGlow" size="sm" onClick={signOut}>
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={LayoutDashboard}
            label="Active projects"
            value={String(activeOrders.length)}
          />
          <SummaryCard
            icon={Globe}
            label="Domains connected"
            value={String((orders.data ?? []).filter((o) => o.domain_status === "live").length)}
          />
          <SummaryCard
            icon={Package}
            label="Subscription"
            value={subscription?.subscription_plan ?? "None"}
          />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your orders</h2>
          {orders.isLoading ? (
            <Loader2 className="mt-4 size-5 animate-spin text-cyan" />
          ) : (orders.data ?? []).length === 0 ? (
            <p className="glass mt-4 rounded-2xl p-6 text-sm text-muted-foreground">
              No orders yet. Submit your first project request below.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {(orders.data ?? []).map((o) => (
                <article key={o.id} className="glass rounded-2xl p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold">
                        {o.project_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{o.package_name}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                    <Field label="Price" value={formatMoney(Number(o.price))} />
                    <Field label="Domain" value={o.domain || "—"} />
                    <Field label="Domain status" value={o.domain_status.replace("_", " ")} />
                    <Field label="Plan" value={o.subscription_plan} />
                  </dl>
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, o.progress)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{o.progress}% complete</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <form
            className="glass rounded-2xl p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const project_name = String(fd.get("project_name") ?? "").trim();
              const description = String(fd.get("description") ?? "").trim();
              if (project_name.length < 2) {
                toast.error("Enter a project name.");
                return;
              }
              createOrder.mutate({ project_name, description });
              e.currentTarget.reset();
            }}
          >
            <h2 className="font-display text-lg font-semibold">New project request</h2>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="project_name">Project name</Label>
                <Input id="project_name" name="project_name" maxLength={120} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">What do you need?</Label>
                <Textarea id="description" name="description" rows={4} maxLength={1000} />
              </div>
              <Button type="submit" variant="hero" disabled={createOrder.isPending}>
                <Plus className="size-4" aria-hidden />
                Submit request
              </Button>
            </div>
          </form>

          <form
            className="glass rounded-2xl p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const subject = String(fd.get("subject") ?? "").trim();
              const message = String(fd.get("message") ?? "").trim();
              const order_id = String(fd.get("order_id") ?? "");
              const priority = String(fd.get("priority") ?? "medium");
              const request_type = String(fd.get("request_type") ?? "feature");
              if (subject.length < 3 || message.length < 5) {
                toast.error("Add a subject and a short description.");
                return;
              }
              createTicket.mutate({ subject, message, order_id, priority, request_type });
              e.currentTarget.reset();
            }}
          >
            <h2 className="font-display text-lg font-semibold">
              Project support &amp; maintenance ticket
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="order_id">Related project</Label>
                <select
                  id="order_id"
                  name="order_id"
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">General request</option>
                  {(orders.data ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="request_type">Request type</Label>
                  <select
                    id="request_type"
                    name="request_type"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm capitalize"
                  >
                    <option value="design">Design update</option>
                    <option value="feature">New feature</option>
                    <option value="bug">Bug fix</option>
                    <option value="content">Content change</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue="medium"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" maxLength={140} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Details</Label>
                <Textarea id="message" name="message" rows={4} maxLength={1000} required />
              </div>
              <Button type="submit" variant="hero" disabled={createTicket.isPending}>
                <LifeBuoy className="size-4" aria-hidden />
                Submit ticket
              </Button>
            </div>
          </form>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your tickets</h2>
          <div className="mt-4 grid gap-3">
            {(tickets.data ?? []).length === 0 && (
              <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">No tickets yet.</p>
            )}
            {(tickets.data ?? []).map((t) => (
              <article key={t.id} className="glass rounded-2xl p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <h3 className="truncate font-medium">{t.subject}</h3>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  {t.request_type.replace(/_/g, " ")} request
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t.message}</p>
                {t.admin_reply && (
                  <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
                    <span className="text-cyan">HN Group:</span> {t.admin_reply}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {user && <Billing userId={user.id} billedTo={profile.data?.full_name || user.email || ""} />}


        <section className="glass mt-10 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <div className="mt-4 grid gap-3 sm:max-w-md">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                maxLength={100}
              />
            </div>
            <Button variant="ghostGlow" onClick={() => saveProfile.mutate()}>
              Save profile
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <Icon className="size-5 text-cyan" aria-hidden />
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate">{value}</dd>
    </div>
  );
}
