import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-white/[0.04] px-3 py-2 text-base text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary/70 focus-visible:shadow-[0_0_0_3px_rgb(34_211_238/0.15),0_0_18px_rgb(34_211_238/0.2)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
});
