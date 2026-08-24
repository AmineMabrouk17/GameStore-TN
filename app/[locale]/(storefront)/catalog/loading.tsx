import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui";
import ProductCardSkeleton from "@/components/storefront/ProductCardSkeleton";

export default async function CatalogLoading() {
  const tc = await getTranslations("common");

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
      role="status"
      aria-label={tc("loading")}
      aria-busy="true"
    >
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </header>

      <div className="glass rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-10 w-full rounded-lg" />
          ))}
          <Skeleton className="h-10 w-full rounded-lg lg:col-span-2" />
        </div>
      </div>

      <Skeleton className="mt-6 h-4 w-28" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, item) => (
          <ProductCardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
}
