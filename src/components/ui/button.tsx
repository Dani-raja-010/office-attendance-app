import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default:
          "bg-brand font-semibold text-primary-foreground shadow-[0_0_22px_-8px_var(--primary)] hover:shadow-[0_0_30px_-4px_var(--primary)] hover:brightness-110",
        destructive:
          "bg-destructive/90 font-semibold text-white shadow-[0_0_22px_-8px_var(--destructive)] hover:bg-destructive hover:shadow-[0_0_30px_-4px_var(--destructive)]",
        success:
          "bg-success font-semibold text-primary-foreground shadow-[0_0_22px_-8px_var(--success)] hover:shadow-[0_0_30px_-4px_var(--success)]",
        outline:
          "border border-white/12 bg-white/[0.03] hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
        secondary: "border border-white/8 bg-secondary text-secondary-foreground hover:bg-white/10",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
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
