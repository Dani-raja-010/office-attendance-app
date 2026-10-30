const shimmer =
  "animate-shimmer rounded-2xl bg-[linear-gradient(90deg,var(--muted)_0%,oklch(1_0_0/0.9)_50%,var(--muted)_100%)] bg-[length:200%_100%] ring-1 ring-border/60";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className={`h-9 w-56 ${shimmer}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-28 ${shimmer}`} />
        ))}
      </div>
      <div className={`h-72 ${shimmer}`} />
    </div>
  );
}
