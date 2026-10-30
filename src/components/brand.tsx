import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logo mark + wordmark used in the sidebar and on the sign-in pages. */
export function Brand({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-brand text-primary-foreground shadow-[0_6px_16px_-6px_color-mix(in_oklch,var(--primary)_60%,transparent)]",
          size === "lg" ? "size-11" : "size-9",
        )}
      >
        <CalendarCheck className={size === "lg" ? "size-6" : "size-5"} />
      </span>
      <span className={cn("font-bold tracking-tight text-foreground", size === "lg" ? "text-xl" : "text-lg")}>
        WorkTrack
      </span>
    </div>
  );
}
