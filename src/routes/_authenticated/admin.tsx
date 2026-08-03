import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useRoles } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, formatMoney } from "@/components/portal/ui";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const TABS = ["Orders", "Clients", "Tickets", "Pricing", "Case studies"] as const;
type Tab = (typeof TABS)[number];

function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useRoles(user?.id);
  const [tab, setTab] = useState<Tab>("Orders");
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-cyan" aria-hidden />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="hero-aura grid min-h-screen place-items-center px-5 text-center">
        <div className="glass max-w-md rounded-2xl p-8">
          <ShieldAlert className="mx-auto size-6 text-primary" aria-hidden />
          <h1 className="mt-4 font-display text-xl font-bold">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn&apos;t have admin access to this control panel.
          </p>
          <Button className="mt-5" variant="ghostGlow" onClick={() => navigate({ to: "/dashboard" })}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-aura min-h-screen pb-24">
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Client dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold">Admin control panel</h1>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
                tab === t
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "Orders" && <OrdersAdmin />}
          {tab === "Clients" && <ClientsAdmin />}
          {tab === "Tickets" && <TicketsAdmin />}
          {tab === "Pricing" && <PricingAdmin />}
          {tab === "Case studies" && <CaseStudiesAdmin />}
        </div>
      </div>
    </div>
  );
}

function useTable(table: "orders" | "profiles" | "tickets" | "packages" | "case_studies") {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Record<string, any>[];
    },
  });
}

function useRowUpdate(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await (supabase.from(table as never) as any).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3">{children}</div>;
}

function OrdersAdmin() {
  const orders = useTable("orders");
  const update = useRowUpdate("orders");
  if (orders.isLoading) return <Loader2 className="size-5 animate-spin text-cyan" />;

  return (
    <Panel>
      {(orders.data ?? []).map((o) => (
        <article key={o["id"]} className="glass rounded-2xl p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <h2 className="truncate font-display text-lg font-semibold">{o["project_name"]}</h2>
            <StatusBadge status={o["status"]} />
          </div>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              update.mutate({
                id: o["id"],
                values: {
                  status: fd.get("status"),
                  progress: Number(fd.get("progress")),
                  domain: String(fd.get("domain") ?? ""),
                  domain_status: fd.get("domain_status"),
                  price: Number(fd.get("price")),
                  package_name: String(fd.get("package_name") ?? ""),
                  subscription_plan: fd.get("subscription_plan"),
                },
              });
            }}
          >
            <Select name="status" label="Status" defaultValue={o["status"]} options={["pending", "in_progress", "review", "completed"]} />
            <Field name="progress" label="Progress %" type="number" defaultValue={o["progress"]} />
            <Field name="domain" label="Domain" defaultValue={o["domain"] ?? ""} />
            <Select name="domain_status" label="Domain status" defaultValue={o["domain_status"]} options={["not_started", "pending", "live"]} />
            <Field name="price" label="Price" type="number" defaultValue={o["price"]} />
            <Field name="package_name" label="Package" defaultValue={o["package_name"] ?? ""} />
            <Select name="subscription_plan" label="Plan" defaultValue={o["subscription_plan"]} options={["none", "managed_monthly", "enterprise"]} />
            <div className="flex items-end">
              <Button type="submit" variant="hero" size="sm" disabled={update.isPending}>
                Save order
              </Button>
            </div>
          </form>
        </article>
      ))}
      {(orders.data ?? []).length === 0 && <Empty label="No orders yet." />}
    </Panel>
  );
}

function ClientsAdmin() {
  const profiles = useTable("profiles");
  if (profiles.isLoading) return <Loader2 className="size-5 animate-spin text-cyan" />;
  return (
    <Panel>
      {(profiles.data ?? []).map((p) => (
        <div key={p["id"]} className="glass grid gap-1 rounded-2xl p-5">
          <p className="font-medium">{p["full_name"] || "Unnamed client"}</p>
          <p className="text-sm text-muted-foreground">{p["email"]}</p>
          {p["company"] && <p className="text-sm text-muted-foreground">{p["company"]}</p>}
        </div>
      ))}
      {(profiles.data ?? []).length === 0 && <Empty label="No clients registered yet." />}
    </Panel>
  );
}

function TicketsAdmin() {
  const tickets = useTable("tickets");
  const update = useRowUpdate("tickets");
  if (tickets.isLoading) return <Loader2 className="size-5 animate-spin text-cyan" />;
  return (
    <Panel>
      {(tickets.data ?? []).map((t) => (
        <article key={t["id"]} className="glass rounded-2xl p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <h2 className="truncate font-medium">{t["subject"]}</h2>
            <StatusBadge status={t["status"]} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t["message"]}</p>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              update.mutate({
                id: t["id"],
                values: { admin_reply: String(fd.get("admin_reply") ?? ""), status: fd.get("status") },
              });
            }}
          >
            <Field name="admin_reply" label="Reply" defaultValue={t["admin_reply"] ?? ""} />
            <Select name="status" label="Status" defaultValue={t["status"]} options={["open", "in_progress", "resolved", "closed"]} />
            <div className="flex items-end">
              <Button type="submit" variant="hero" size="sm">
                Save
              </Button>
            </div>
          </form>
        </article>
      ))}
      {(tickets.data ?? []).length === 0 && <Empty label="No tickets yet." />}
    </Panel>
  );
}

function PricingAdmin() {
  const packages = useTable("packages");
  const update = useRowUpdate("packages");
  if (packages.isLoading) return <Loader2 className="size-5 animate-spin text-cyan" />;
  return (
    <Panel>
      {(packages.data ?? []).map((p) => (
        <article key={p["id"]} className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">{p["name"]}</h2>
          <p className="text-sm text-muted-foreground">
            Current: {formatMoney(Number(p["price"]))}
            {p["billing_period"] === "monthly" ? " / month" : ""}
          </p>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              update.mutate({
                id: p["id"],
                values: {
                  price: Number(fd.get("price")),
                  tagline: String(fd.get("tagline") ?? ""),
                  delivery_time: String(fd.get("delivery_time") ?? ""),
                },
              });
            }}
          >
            <Field name="price" label="Price" type="number" defaultValue={p["price"]} />
            <Field name="tagline" label="Tagline" defaultValue={p["tagline"] ?? ""} />
            <Field name="delivery_time" label="Delivery" defaultValue={p["delivery_time"] ?? ""} />
            <div>
              <Button type="submit" variant="hero" size="sm">
                Update pricing
              </Button>
            </div>
          </form>
        </article>
      ))}
    </Panel>
  );
}

function toList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function CaseStudiesAdmin() {
  const studies = useTable("case_studies");
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { error } = await (supabase.from("case_studies") as any).insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Case study published.");
      qc.invalidateQueries({ queryKey: ["admin", "case_studies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("case_studies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Case study deleted.");
      qc.invalidateQueries({ queryKey: ["admin", "case_studies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6">
      <form
        className="glass rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          const title = String(fd.get("title") ?? "").trim();
          if (title.length < 3) {
            toast.error("Add a project title.");
            return;
          }
          create.mutate({
            title,
            slug: slugify(String(fd.get("slug") || title)),
            client_name: String(fd.get("client_name") ?? ""),
            category: fd.get("category"),
            live_url: String(fd.get("live_url") ?? ""),
            summary: String(fd.get("summary") ?? ""),
            problem: String(fd.get("problem") ?? ""),
            solution: String(fd.get("solution") ?? ""),
            results: String(fd.get("results") ?? ""),
            cover_image: String(fd.get("cover_image") ?? ""),
            gallery: toList(fd.get("gallery")),
            features: toList(fd.get("features")),
            tech_stack: toList(fd.get("tech_stack")),
            published: true,
          });
          form.reset();
        }}
      >
        <h2 className="font-display text-lg font-semibold">Add a case study</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field name="title" label="Project title" required />
          <Field name="slug" label="Slug (optional)" />
          <Field name="client_name" label="Client name" />
          <Select
            name="category"
            label="Category"
            defaultValue="SaaS"
            options={["SaaS", "E-Commerce", "Local Business", "AI Tool", "Enterprise"]}
          />
          <Field name="live_url" label="Live website URL" type="url" />
          <Field name="cover_image" label="Cover image URL" />
        </div>
        <div className="mt-3 grid gap-3">
          <Area name="summary" label="Short summary" />
          <Area name="problem" label="The business problem" />
          <Area name="solution" label="The AI solution provided" />
          <Area name="results" label="Impact & results" />
          <Field name="features" label="Key features (comma separated)" />
          <Field name="tech_stack" label="Tech stack (comma separated)" />
          <Field name="gallery" label="Gallery image URLs (comma separated)" />
        </div>
        <Button type="submit" variant="hero" className="mt-5" disabled={create.isPending}>
          <Plus className="size-4" aria-hidden />
          Publish case study
        </Button>
      </form>

      <Panel>
        {(studies.data ?? []).map((s) => (
          <div key={s["id"]} className="glass grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl p-5">
            <div className="min-w-0">
              <p className="truncate font-medium">{s["title"]}</p>
              <p className="text-sm text-muted-foreground">
                {s["category"]} · /case-studies/{s["slug"]}
              </p>
            </div>
            <Button
              variant="ghostGlow"
              size="sm"
              aria-label={`Delete ${s["title"]}`}
              onClick={() => remove.mutate(s["id"])}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function Area({ name, label }: { name: string; label: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Textarea id={name} name={name} rows={3} maxLength={4000} />
    </div>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">{label}</p>;
}
