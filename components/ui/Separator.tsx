import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-linear-to-r from-transparent via-white/15 to-transparent",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px bg-linear-to-b",
        className,
      )}
      {...props}
    />
  );
}
