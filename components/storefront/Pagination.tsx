import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  query: Record<string, string>;
}

function pageHref(query: Record<string, string>, page: number): string {
  const params = new URLSearchParams({ ...query, page: String(page) });
  return `/catalog?${params.toString()}`;
}

export default function Pagination({ page, pageSize, total, query }: PaginationProps) {
  const t = useTranslations("catalog");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label={t("resultsCount", { count: total })}>
      {page > 1 ? (
        <Link href={pageHref(query, page - 1)} scroll={false}>
          <Button variant="secondary" size="sm" aria-label={t("previousPage")}>
            <ChevronLeft className="size-4 rtl:hidden" aria-hidden />
            <ChevronRight className="size-4 ltr:hidden" aria-hidden />
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled aria-label={t("previousPage")}>
          <ChevronLeft className="size-4 rtl:hidden" aria-hidden />
          <ChevronRight className="size-4 ltr:hidden" aria-hidden />
        </Button>
      )}

      <span className="text-sm font-bold text-neutral-300">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={pageHref(query, page + 1)} scroll={false}>
          <Button variant="secondary" size="sm" aria-label={t("nextPage")}>
            <ChevronRight className="size-4 rtl:hidden" aria-hidden />
            <ChevronLeft className="size-4 ltr:hidden" aria-hidden />
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled aria-label={t("nextPage")}>
          <ChevronRight className="size-4 rtl:hidden" aria-hidden />
          <ChevronLeft className="size-4 ltr:hidden" aria-hidden />
        </Button>
      )}
    </nav>
  );
}
