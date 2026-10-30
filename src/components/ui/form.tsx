import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full min-w-0 rounded-lg border border-input bg-white/[0.03] px-3 text-sm transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground/70 hover:border-white/20 focus-visible:border-primary/60 focus-visible:bg-white/[0.05] focus-visible:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent),0_0_20px_-6px_var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive [&>option]:bg-popover";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(fieldBase, "h-10 py-1", className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldBase, "min-h-24 py-2", className)} {...props} />;
}

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="select" className={cn(fieldBase, "h-10 py-1 pr-8", className)} {...props} />;
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="label" className={cn("font-mono text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-muted-foreground", className)} {...props} />;
}

export { Input, Textarea, Select, Label };
