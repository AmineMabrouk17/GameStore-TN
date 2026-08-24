"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div>
      <div className="glass relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/50">
        {current ? (
          <img src={current} alt={`${title} — ${t("imageAlt")} ${active + 1}`} className="size-full object-contain" />
        ) : (
          <div className="grid size-full place-items-center text-6xl font-black text-white/10">
            {title.slice(0, 2)}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t("imageAlt")}>
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              aria-label={`${t("imageAlt")} ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-black/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                index === active
                  ? "border-primary glow-cyan"
                  : "border-white/10 opacity-60 hover:opacity-100",
              )}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
