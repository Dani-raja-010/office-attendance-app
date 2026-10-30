import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  primary: { icon: "text-primary bg-primary/10 ring-primary/30", value: "text-brand", line: "from-primary/70" },
  success: { icon: "text-success bg-success/10 ring-success/30", value: "text-success", line: "from-success/70" },
  warning: { icon: "text-warning bg-warning/10 ring-warning/30", value: "text-warning", line: "from-warning/70" },
  destructive: {
    icon: "text-destructive bg-destructive/10 ring-destructive/30",
    value: "text-destructive",
    line: "from-destructive/70",
  },
  muted: { icon: "text-muted-foreground bg-white/[0.05] ring-white/10", value: "text-foreground", line: "from-white/30" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  const t = tones[tone];
  return (
    <Card className="group gap-0 overflow-hidden px-4 py-4 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className={cn("mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight", t.value)}>{value}</p>
          {hint && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("shrink-0 rounded-lg p-2 ring-1", t.icon)}>
          <Icon className="size-4" />
        </span>
      </div>
      {/* Accent line that lights up along the bottom edge */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r to-transparent opacity-60 transition-opacity group-hover:opacity-100",
          t.line,
        )}
      />
    </Card>
  );
}
