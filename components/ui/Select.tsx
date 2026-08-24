import { forwardRef, type SelectHTMLAttributes } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-lg border border-input bg-white/[0.04] ps-3 pe-9 text-base text-foreground transition-all duration-200 focus-visible:border-primary/70 focus-visible:shadow-[0_0_0_3px_rgb(34_211_238/0.15),0_0_18px_rgb(34_211_238/0.2)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm [&>option]:bg-card [&>option]:text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
});
