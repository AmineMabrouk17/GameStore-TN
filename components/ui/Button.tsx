import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "default" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-linear-to-r from-primary to-cyan-300 text-primary-foreground shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-110",
  secondary:
    "border border-white/10 bg-white/[0.07] text-foreground backdrop-blur-md hover:bg-white/[0.12]",
  outline:
    "border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_16px_rgb(34_211_238/0.25)]",
  ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
  destructive:
    "bg-linear-to-r from-danger to-accent text-white shadow-md shadow-rose-500/25 hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs",
  default: "h-10 rounded-lg px-5 text-sm",
  lg: "h-12 rounded-xl px-8 text-base",
  icon: "size-10 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all duration-200 select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
});
