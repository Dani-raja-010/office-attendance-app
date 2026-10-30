import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  primary: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  success: { icon: "bg-success/12 text-success", value: "text-foreground" },
  warning: { icon: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_25%)]", value: "text-foreground" },
  destructive: { icon: "bg-destructive/10 text-destructive", value: "text-foreground" },
  muted: { icon: "bg-secondary text-muted-foreground", value: "text-foreground" },
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
    <Card className="gap-0 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn("mt-1.5 text-3xl font-bold tabular-nums tracking-tight", t.value)}>{value}</p>
          {hint && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("shrink-0 rounded-xl p-2.5", t.icon)}>
          <Icon className="size-4" />
        </span>
      </div>
    </Card>
  );
}
