"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button, Input, Select } from "@/components/ui";
import type { Locale } from "@/types";

interface FilterBarProps {
  categories: { slug: string; name_ar: string; name_fr: string }[];
  current: {
    categorySlug?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    sort?: string;
  };
}

const STATUS_OPTIONS = ["AVAILABLE", "RESERVED", "SOLD"] as const;
const SORT_OPTIONS = ["newest", "price_asc", "price_desc"] as const;

export default function FilterBar({ categories, current }: FilterBarProps) {
  const t = useTranslations("catalog");
  const locale = (useLocale() as Locale) ?? "ar";
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(current.q ?? "");

  useEffect(() => {
    setQ(current.q ?? "");
  }, [current.q]);

  function buildQuery(next: Partial<FilterBarProps["current"]>): string {
    const merged: Record<string, string> = {};
    for (const [key, value] of Object.entries({ ...current, ...next })) {
      if (value !== undefined && value !== "") {
        merged[key] = String(value);
      }
    }
    return new URLSearchParams(merged).toString();
  }

  function navigate(next: Partial<FilterBarProps["current"]>) {
    const query = buildQuery(next);
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed === (current.q ?? "")) return;
    const handle = setTimeout(() => {
      navigate({ q: trimmed || undefined });
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="relative block">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9"
          />
        </label>

        <Select
          aria-label={t("category")}
          value={current.categorySlug ?? ""}
          onChange={(event) =>
            navigate({ categorySlug: event.target.value || undefined })
          }
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {locale === "ar" ? category.name_ar : category.name_fr}
            </option>
          ))}
        </Select>

        <Select
          aria-label={t("availability")}
          value={current.status ?? ""}
          onChange={(event) => navigate({ status: event.target.value || undefined })}
        >
          <option value="">{t("anyStatus")}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === "AVAILABLE"
                ? t("available")
                : status === "RESERVED"
                  ? t("reserved")
                  : t("sold")}
            </option>
          ))}
        </Select>

        <Select
          aria-label={t("sort")}
          value={current.sort ?? "newest"}
          onChange={(event) => navigate({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((sort) => (
            <option key={sort} value={sort}>
              {sort === "newest"
                ? t("sortNewest")
                : sort === "price_asc"
                  ? t("sortPriceAsc")
                  : t("sortPriceDesc")}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2 lg:col-span-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder={t("min")}
            aria-label={`${t("priceRange")} — ${t("min")}`}
            defaultValue={current.minPrice ?? ""}
            onBlur={(event) =>
              navigate({ minPrice: event.target.value || undefined })
            }
          />
          <span className="text-neutral-500">—</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder={t("max")}
            aria-label={`${t("priceRange")} — ${t("max")}`}
            defaultValue={current.maxPrice ?? ""}
            onBlur={(event) =>
              navigate({ maxPrice: event.target.value || undefined })
            }
          />
        </div>

        <Button
          variant="ghost"
          className="lg:col-span-2"
          disabled={pending}
          onClick={() => {
            setQ("");
            startTransition(() => {
              router.replace(pathname, { scroll: false });
            });
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
