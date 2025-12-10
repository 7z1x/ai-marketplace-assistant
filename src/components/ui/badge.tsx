import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        soft: "border-transparent bg-primary/10 text-primary",
        softSuccess: "border-transparent bg-success/10 text-success",
        softDestructive: "border-transparent bg-destructive/10 text-destructive",
        category: "border-border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all duration-200",
        stock: "border-transparent bg-success/10 text-success font-medium",
        outOfStock: "border-transparent bg-destructive/10 text-destructive font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
