import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui";

export default async function DashboardLoading() {
  const tc = await getTranslations("common");

  return (
    <div
      className="space-y-8"
      role="status"
      aria-label={tc("loading")}
      aria-busy="true"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-56" />
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="glass space-y-3 rounded-2xl p-5">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
        <div className="glass col-span-2 rounded-2xl p-5 lg:col-span-4">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <div className="glass space-y-4 overflow-x-auto rounded-2xl p-4">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-4">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="hidden h-4 w-20 sm:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="ms-auto h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
