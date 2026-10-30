const shimmer =
  "animate-shimmer rounded-2xl border border-white/[0.06] bg-[linear-gradient(90deg,oklch(1_0_0/0.03)_0%,oklch(1_0_0/0.08)_50%,oklch(1_0_0/0.03)_100%)] bg-[length:200%_100%]";

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
