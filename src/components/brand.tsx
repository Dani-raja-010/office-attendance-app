import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logo mark + wordmark used in the sidebar and on the sign-in pages. */
export function Brand({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-brand text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)]",
          size === "lg" ? "size-11" : "size-9",
        )}
      >
        <Radar className={size === "lg" ? "size-6" : "size-5"} />
      </span>
      <span className="leading-none">
        <span className={cn("block font-semibold tracking-[0.2em] text-foreground", size === "lg" ? "text-lg" : "text-sm")}>
          WORKTRACK
        </span>
        <span className="mt-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 animate-blink rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          System online
        </span>
      </span>
    </div>
  );
}
