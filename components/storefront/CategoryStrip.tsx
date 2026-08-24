import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CategoryWithCount, Locale } from "@/types";

interface CategoryStripProps {
  categories: CategoryWithCount[];
}

export default async function CategoryStrip({ categories }: CategoryStripProps) {
  const t = await getTranslations("catalog");

  if (categories.length === 0) return null;

  return <StripInner categories={categories} label={t("category")} />;
}

function StripInner({
  categories,
  label,
}: {
  categories: CategoryWithCount[];
  label: string;
}) {
  const locale = (useLocale() as Locale) ?? "ar";

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={{ pathname: "/catalog", query: { category: category.slug } }}
            className="glass group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-neutral-200 transition-all hover:border-primary/50 hover:text-white hover:glow-cyan"
          >
            {locale === "ar" ? category.name_ar : category.name_fr}
            <span
              className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-cyan-300"
              aria-label={label}
            >
              {category.product_count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
