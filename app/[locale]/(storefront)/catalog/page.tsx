import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getDb } from "@/lib/db";
import { list as listCategories } from "@/lib/repositories/categories";
import { list as listProducts } from "@/lib/repositories/products";
import { productQuerySchema } from "@/lib/validation";
import FilterBar from "@/components/storefront/FilterBar";
import ProductCard from "@/components/storefront/ProductCard";
import EmptyState from "@/components/storefront/EmptyState";
import Pagination from "@/components/storefront/Pagination";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalog");
  return { title: t("title"), description: t("subtitle") };
}

function parseFilters(searchParams: SearchParams) {
  const raw = {
    categorySlug: firstValue(searchParams.category),
    status: firstValue(searchParams.status) as "AVAILABLE" | "RESERVED" | "SOLD" | undefined,
    minPrice: firstValue(searchParams.min),
    maxPrice: firstValue(searchParams.max),
    q: firstValue(searchParams.q),
    sort: firstValue(searchParams.sort) as "newest" | "price_asc" | "price_desc" | undefined,
    page: firstValue(searchParams.page),
    pageSize: "12",
  };
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, value]) => value !== undefined && value !== ""),
  );
  return productQuerySchema.safeParse(cleaned);
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const t = await getTranslations("catalog");
  const parsed = parseFilters(params);
  const filters = parsed.success ? parsed.data : productQuerySchema.parse({});

  const db = await getDb();
  const [categories, result] = await Promise.all([
    listCategories(db),
    listProducts(filters, db),
  ]);

  const current = {
    categorySlug: filters.categorySlug,
    status: filters.status,
    minPrice: filters.minPrice !== undefined ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice !== undefined ? String(filters.maxPrice) : undefined,
    q: filters.q,
    sort: filters.sort,
  };

  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(current)) {
    if (value !== undefined && value !== "") query[key] = String(value);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-2 text-neutral-400">{t("subtitle")}</p>
      </header>

      <Suspense>
        <FilterBar categories={categories} current={current} />
      </Suspense>

      <p className="mt-6 text-sm font-bold text-neutral-400" aria-live="polite">
        {t("resultsCount", { count: result.total })}
      </p>

      <div className="mt-10">
        {result.items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              page={filters.page}
              pageSize={filters.pageSize}
              total={result.total}
              query={query}
            />
          </>
        )}
      </div>
    </div>
  );
}
