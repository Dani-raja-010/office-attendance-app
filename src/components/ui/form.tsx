import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full min-w-0 rounded-xl border border-input bg-white/90 px-3.5 text-sm shadow-[0_1px_2px_oklch(0.3_0.05_280/0.04)] transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground/70 hover:border-primary/30 focus-visible:border-primary/60 focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

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
  return <label data-slot="label" className={cn("text-sm font-medium leading-none text-foreground/80", className)} {...props} />;
}

export { Input, Textarea, Select, Label };
