import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui";
import ProductCardSkeleton from "@/components/storefront/ProductCardSkeleton";

export default async function StorefrontLoading() {
  const tc = await getTranslations("common");

  return (
    <div
      className="space-y-24 pb-24"
      role="status"
      aria-label={tc("loading")}
      aria-busy="true"
    >
      <section className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
          <Skeleton className="h-7 w-64 rounded-full" />
          <div className="w-full space-y-3">
            <Skeleton className="mx-auto h-12 w-full max-w-md" />
            <Skeleton className="mx-auto h-12 w-2/3" />
          </div>
          <div className="w-full space-y-2.5">
            <Skeleton className="mx-auto h-4 w-full max-w-lg" />
            <Skeleton className="mx-auto h-4 w-4/5 max-w-md" />
          </div>
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
          <div className="mx-auto mt-8 grid w-full max-w-xl grid-cols-3 gap-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 sm:px-6">
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-10 w-32 rounded-full" />
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="hidden h-8 w-28 rounded-md sm:block" />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <ProductCardSkeleton key={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
