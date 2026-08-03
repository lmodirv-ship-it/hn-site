import { Star } from "lucide-react";

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`Rated ${rounded} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={
            i <= rounded ? "size-3.5 fill-cyan text-cyan" : "size-3.5 text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}
