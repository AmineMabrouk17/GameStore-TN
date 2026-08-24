"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge, Button, Input } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import type {
  Currency,
  Locale,
  ProductStatus,
  ProductWithCategory,
} from "@/types";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<ProductStatus, "success" | "warning" | "danger"> = {
  AVAILABLE: "success",
  RESERVED: "warning",
  SOLD: "danger",
};

export type StatusTab = ProductStatus | "ALL";

interface DataTableProps {
  items: ProductWithCategory[];
  query: string;
  onQueryChange: (value: string) => void;
  tab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
  page: number;
  pageSize: number;
  total: number;
  busyId: string | null;
  onMarkSold: (product: ProductWithCategory) => void;
  onToggleFeatured: (product: ProductWithCategory) => void;
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
  onPageChange: (page: number) => void;
}

export default function DataTable({
  items,
  query,
  onQueryChange,
  tab,
  onTabChange,
  page,
  pageSize,
  total,
  busyId,
  onMarkSold,
  onToggleFeatured,
  onEdit,
  onDelete,
  onPageChange,
}: DataTableProps) {
  const t = useTranslations("admin");
  const tf = useTranslations("adminForm");
  const locale = (useLocale() as Locale) ?? "ar";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tabs: { value: StatusTab; label: string }[] = [
    { value: "ALL", label: tf("all") },
    { value: "AVAILABLE", label: t("available") },
    { value: "RESERVED", label: t("reserved") },
    { value: "SOLD", label: t("sold") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("searchProducts")}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onTabChange(item.value)}
              aria-pressed={tab === item.value}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                tab === item.value
                  ? "bg-primary text-neutral-950 glow-cyan"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="glass rounded-2xl p-10 text-center text-sm font-bold text-neutral-400">
          {tf("noProducts")}
        </p>
      ) : (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-start text-xs uppercase tracking-wide text-neutral-400">
                <th scope="col" className="px-4 py-3 text-start">{t("title")}</th>
                <th scope="col" className="px-4 py-3 text-start">{t("price")}</th>
                <th scope="col" className="px-4 py-3 text-start">{t("category")}</th>
                <th scope="col" className="px-4 py-3 text-start">{t("status")}</th>
                <th scope="col" className="px-4 py-3 text-center">{t("featured")}</th>
                <th scope="col" className="px-4 py-3 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => {
                const title = locale === "ar" ? product.title_ar : product.title_fr;
                const categoryName = product.category
                  ? locale === "ar"
                    ? product.category.name_ar
                    : product.category.name_fr
                  : t("uncategorized");
                const busy = busyId === product.id;
                return (
                  <tr
                    key={product.id}
                    className={cn(
                      "border-b border-white/5 transition-opacity last:border-0",
                      busy && "pointer-events-none opacity-50",
                      product.status === "SOLD" && "opacity-70",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="size-11 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-black text-white/40">
                            {title.slice(0, 2)}
                          </span>
                        )}
                        <Link
                          href={`/${locale}/product/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 max-w-[220px] font-bold hover:text-primary"
                        >
                          {title}
                        </Link>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-black text-cyan-300">
                      {formatPrice(product.price, product.currency as Currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{categoryName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[product.status]}>
                        {product.status === "AVAILABLE"
                          ? t("available")
                          : product.status === "RESERVED"
                            ? t("reserved")
                            : t("sold")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("toggleFeatured")}
                        onClick={() => onToggleFeatured(product)}
                      >
                        <Star
                          className={cn(
                            "size-4",
                            product.featured &&
                              "fill-violet-400 text-violet-400 drop-shadow-[0_0_6px_rgb(139_92_246/0.8)]",
                          )}
                        />
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {product.status !== "SOLD" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={t("markSold")}
                            onClick={() => onMarkSold(product)}
                          >
                            <CheckCircle2 className="size-4 text-emerald-300" aria-hidden />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                          <Pencil className="size-4" aria-hidden />
                          <span className="sr-only">{t("edit")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t("delete")}
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="size-4 text-rose-300" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {tf("pageOf", { page, total: totalPages })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {tf("previous")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {tf("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
