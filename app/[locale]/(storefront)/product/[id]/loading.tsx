import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui";

export default async function ProductLoading() {
  const tc = await getTranslations("common");

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
      role="status"
      aria-label={tc("loading")}
      aria-busy="true"
    >
      <Skeleton className="h-4 w-32" />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <div className="mt-3 flex gap-2">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="aspect-[4/3] w-20 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        <div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-10 w-full max-w-md" />
          <Skeleton className="mt-6 h-11 w-40 rounded-xl" />
          <Skeleton className="my-8 h-px w-full" />
          <dl className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </dl>
          <Skeleton className="my-8 h-px w-full" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      <section className="mt-14 max-w-3xl">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-4 h-32 rounded-2xl" />
      </section>

      <section className="mt-20">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, item) => (
            <Skeleton key={item} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
