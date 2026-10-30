import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-primary-foreground shadow-[0_6px_16px_-6px_color-mix(in_oklch,var(--primary)_55%,transparent)] hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_color-mix(in_oklch,var(--primary)_60%,transparent)]",
        destructive:
          "bg-destructive text-white shadow-[0_6px_16px_-6px_color-mix(in_oklch,var(--destructive)_55%,transparent)] hover:-translate-y-px hover:bg-destructive/90",
        success:
          "bg-success text-white shadow-[0_6px_16px_-6px_color-mix(in_oklch,var(--success)_55%,transparent)] hover:-translate-y-px hover:bg-success/90",
        outline:
          "border border-border bg-white/80 text-foreground shadow-soft hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
