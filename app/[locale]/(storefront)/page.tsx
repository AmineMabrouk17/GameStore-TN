import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { getDb } from "@/lib/db";
import { list as listCategories } from "@/lib/repositories/categories";
import { getFeatured, list as listProducts } from "@/lib/repositories/products";
import { buildGenericWhatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui";
import { FadeIn } from "@/components/animations/FadeIn";
import HeroSection from "@/components/storefront/HeroSection";
import FeaturedSection from "@/components/storefront/FeaturedSection";
import CategoryStrip from "@/components/storefront/CategoryStrip";
import HowItWorks from "@/components/storefront/HowItWorks";

export const dynamic = "force-dynamic";

export default async function StorefrontLandingPage() {
  const db = await getDb();
  const t = await getTranslations("storefront");

  const [categories, available, sold, featured] = await Promise.all([
    listCategories(db),
    listProducts({ status: "AVAILABLE", pageSize: 1 }, db),
    listProducts({ status: "SOLD", pageSize: 1 }, db),
    getFeatured(db),
  ]);

  const whatsappHref = buildGenericWhatsappUrl("ar");

  return (
    <div className="space-y-24 pb-24">
      <HeroSection
        stats={{
          available: available.total,
          categories: categories.length,
          sold: sold.total,
        }}
      />

      <CategoryStrip categories={categories} />

      {featured.length > 0 && <FeaturedSection products={featured} />}

      <HowItWorks />

      {whatsappHref && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <div className="glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
              <div
                className="absolute -top-20 start-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]"
                aria-hidden
              />
              <h2 className="text-gradient relative text-3xl font-black sm:text-4xl">
                {t("ctaTitle")}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-neutral-300">
                {t("ctaSubtitle")}
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-8 inline-block"
              >
                <Button size="lg" className="glow-cyan">
                  <MessageCircle className="size-5" aria-hidden />
                  WhatsApp
                </Button>
              </a>
            </div>
          </FadeIn>
        </section>
      )}
    </div>
  );
}
