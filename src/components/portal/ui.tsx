export function formatMoney(value: number) {
  // Deterministic formatting (no locale) so SSR and client output match.
  const rounded = Math.round(value);
  return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
};

export function StatusBadge({ status }: { status: string }) {
  const tone = tones[status] ?? "bg-surface-2 text-muted-foreground";
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs capitalize ${tone}`}>
      {status.replace("_", " ")}
    </span>
  );
}
