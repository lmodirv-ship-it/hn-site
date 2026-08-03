import { useQuery } from "@tanstack/react-query";
import { CreditCard, Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatusBadge, formatMoney, formatDate } from "@/components/portal/ui";
import { downloadInvoicePdf, type InvoiceRecord } from "@/lib/invoice-pdf";

export function Billing({ userId, billedTo }: { userId: string; billedTo: string }) {
  const subscriptions = useQuery({
    queryKey: ["my-subscriptions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invoices = useQuery({
    queryKey: ["my-invoices", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const download = async (invoice: InvoiceRecord) => {
    try {
      await downloadInvoicePdf(invoice, billedTo);
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    }
  };

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold">Billing & subscriptions</h2>

      <div className="mt-4 grid gap-3">
        {subscriptions.isLoading && <Loader2 className="size-5 animate-spin text-cyan" />}
        {!subscriptions.isLoading && (subscriptions.data ?? []).length === 0 && (
          <div className="glass rounded-2xl p-6">
            <CreditCard className="size-5 text-cyan" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              No active hosting or AI maintenance plan yet. Ask us to enable a monthly or yearly
              plan and it will appear here with automatic invoices.
            </p>
          </div>
        )}
        {(subscriptions.data ?? []).map((s) => (
          <article key={s.id} className="glass rounded-2xl p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-semibold">{s.plan_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(Number(s.price), s.currency)} / {s.interval.replace(/ly$/, "")}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-cyan" aria-hidden />
              Renews {formatDate(s.current_period_end)} · secured by {s.provider}
            </p>
          </article>
        ))}
      </div>

      <h3 className="mt-8 font-display text-lg font-semibold">Invoices</h3>
      <div className="mt-3 grid gap-3">
        {invoices.isLoading && <Loader2 className="size-5 animate-spin text-cyan" />}
        {!invoices.isLoading && (invoices.data ?? []).length === 0 && (
          <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
            No invoices issued yet.
          </p>
        )}
        {(invoices.data ?? []).map((i) => (
          <article
            key={i.id}
            className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                <FileText className="size-4 shrink-0 text-cyan" aria-hidden />
                <span className="truncate">{i.invoice_number}</span>
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {i.description || "Web development services"} · issued {formatDate(i.issued_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-lg font-semibold">
                {formatMoney(Number(i.amount), i.currency)}
              </span>
              <StatusBadge status={i.status} />
              <Button
                variant="ghostGlow"
                size="sm"
                onClick={() => download(i as unknown as InvoiceRecord)}
              >
                <Download className="size-4" aria-hidden />
                PDF
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
