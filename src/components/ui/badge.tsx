import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/8 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-success/20 bg-success/10 text-[color-mix(in_oklch,var(--success),black_18%)]",
        warning: "border-warning/25 bg-warning/12 text-[color-mix(in_oklch,var(--warning),black_30%)]",
        destructive: "border-destructive/20 bg-destructive/8 text-destructive",
        outline: "border-border bg-white/60 text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
