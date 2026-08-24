"use client";

import { useTranslations } from "next-intl";
import { Clock, PackageCheck, PackageX, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductStats {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  featured: number;
}

interface StatCardsProps {
  stats: ProductStats;
}

const CARDS: {
  key: keyof Omit<ProductStats, "featured">;
  labelKey: string;
  icon: typeof Layers;
  accent: string;
}[] = [
  { key: "total", labelKey: "totalProducts", icon: Layers, accent: "text-primary" },
  { key: "available", labelKey: "available", icon: PackageCheck, accent: "text-emerald-300" },
  { key: "reserved", labelKey: "reserved", icon: Clock, accent: "text-amber-300" },
  { key: "sold", labelKey: "sold", icon: PackageX, accent: "text-rose-300" },
];

export default function StatCards({ stats }: StatCardsProps) {
  const t = useTranslations("admin");

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.key} className="glass rounded-2xl p-5">
          <card.icon className={cn("size-6", card.accent)} aria-hidden />
          <p className="mt-3 text-3xl font-black">{stats[card.key]}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
            {t(card.labelKey)}
          </p>
        </div>
      ))}
      <div className="glass col-span-2 rounded-2xl p-5 lg:col-span-4">
        <span className="text-sm font-bold text-violet-300">★ {t("featured")}: {stats.featured}</span>
      </div>
    </div>
  );
}
