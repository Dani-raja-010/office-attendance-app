import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone =
    pct >= 100
      ? "bg-success shadow-[0_0_12px_var(--success)]"
      : pct >= 50
        ? "bg-brand shadow-[0_0_12px_-2px_var(--primary)]"
        : "bg-warning shadow-[0_0_12px_-2px_var(--warning)]";
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}
    >
      <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}
