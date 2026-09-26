import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-primary/20 bg-primary/10 text-[color:var(--link)]",
        outline: "border-foreground/15 text-muted-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 [.theme-dark_&]:text-emerald-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
