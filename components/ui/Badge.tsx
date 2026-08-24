import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "featured";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-primary/40 bg-primary/15 text-cyan-300",
  secondary: "border-white/10 bg-white/[0.07] text-slate-200",
  outline: "border-border bg-transparent text-muted-foreground",
  success: "border-success/40 bg-success/15 text-emerald-300",
  warning: "border-warning/40 bg-warning/15 text-amber-300",
  danger: "border-danger/40 bg-danger/15 text-rose-300",
  featured: "border-violet/40 bg-violet/15 text-violet-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
