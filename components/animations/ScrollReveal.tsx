"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  x?: number;
  y?: number;
  blur?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  x = 0,
  y = 32,
  blur = 6,
  delay = 0,
  duration = 0.7,
  once = true,
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  const hiddenX = reducedMotion ? 0 : x;
  const hiddenY = reducedMotion ? 0 : y;
  const hiddenBlur = reducedMotion ? 0 : blur;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: hiddenX,
        y: hiddenY,
        filter: hiddenBlur > 0 ? `blur(${hiddenBlur}px)` : "blur(0px)",
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once }}
      transition={{ duration: reducedMotion ? 0 : duration, delay, ease: [0.21, 0.65, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}
