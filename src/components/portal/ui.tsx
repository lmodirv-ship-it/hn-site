export function formatMoney(value: number, currency = "USD") {
  // Deterministic formatting (no locale) so SSR and client output match.
  const rounded = Math.round(value);
  const withSeparators = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (currency === "USD") return "$" + withSeparators;
  if (currency === "EUR") return "€" + withSeparators;
  return `${withSeparators} ${currency}`;
}

/** Deterministic YYYY-MM-DD date rendering (SSR-safe). */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return value.slice(0, 10);
}

const tones: Record<string, string> = {
  pending: "bg-surface-2 text-muted-foreground",
  in_progress: "bg-primary/20 text-foreground",
  review: "bg-primary/20 text-foreground",
  completed: "bg-cyan/20 text-cyan",
  live: "bg-cyan/20 text-cyan",
  open: "bg-primary/20 text-foreground",
  resolved: "bg-cyan/20 text-cyan",
  closed: "bg-surface-2 text-muted-foreground",
  active: "bg-cyan/20 text-cyan",
  trialing: "bg-primary/20 text-foreground",
  past_due: "bg-destructive/20 text-destructive",
  canceled: "bg-surface-2 text-muted-foreground",
  paid: "bg-cyan/20 text-cyan",
  due: "bg-primary/20 text-foreground",
  overdue: "bg-destructive/20 text-destructive",
  void: "bg-surface-2 text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = tones[status] ?? "bg-surface-2 text-muted-foreground";
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs capitalize ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

const priorityTones: Record<string, string> = {
  low: "bg-surface-2 text-muted-foreground",
  medium: "bg-primary/20 text-foreground",
  critical: "bg-destructive/20 text-destructive",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const tone = priorityTones[priority] ?? priorityTones["medium"];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs capitalize ${tone}`}>
      {priority} priority
    </span>
  );
}
