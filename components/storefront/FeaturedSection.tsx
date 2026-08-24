import { getTranslations } from "next-intl/server";
import { Flame } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerGroup } from "@/components/animations/StaggerGroup";
import ProductCard from "@/components/storefront/ProductCard";
import type { ProductWithCategory } from "@/types";

interface FeaturedSectionProps {
  products: ProductWithCategory[];
}

export default async function FeaturedSection({ products }: FeaturedSectionProps) {
  const t = await getTranslations("catalog");

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <FadeIn className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
          <Flame className="size-6 text-magenta" aria-hidden />
          {t("title")}
        </h2>
        <Link href="/catalog" className="hidden sm:block">
          <Button variant="ghost" size="sm">
            {t("apply")} →
          </Button>
        </Link>
      </FadeIn>

      <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </StaggerGroup>
    </section>
  );
}
