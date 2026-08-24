import { Skeleton } from "@/components/ui";

export default function ProductCardSkeleton() {
  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-6 w-16 shrink-0" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="size-8 shrink-0" />
        </div>
      </div>
    </div>
  );
}
