import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import FacebookIcon from "@/components/FacebookIcon";
import { getDb } from "@/lib/db";
import { list as listCategories } from "@/lib/repositories/categories";
import { getFeatured, list as listProducts } from "@/lib/repositories/products";
import { buildGenericWhatsappUrl } from "@/lib/whatsapp";
import { FACEBOOK_PAGE_URL } from "@/lib/facebook";
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
        product={featured.at(0) ?? null}
      />

      <CategoryStrip categories={categories} />

      {featured.length > 0 && <FeaturedSection products={featured} />}

      <HowItWorks />

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-[rgb(204_255_51/0.35)] bg-gradient-to-b from-primary/[0.06] to-transparent p-10 text-center sm:p-14">
            <h2 className="relative text-3xl font-black sm:text-4xl">
              {t("ctaTitle")
                .split(/([?؟])/)
                .map((part, i) =>
                  /[?؟]/.test(part) ? (
                    <span key={i} className="text-primary">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-neutral-300">
              {t("ctaSubtitle")}
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="glow-cyan">
                  <FacebookIcon className="size-5" aria-hidden />
                  {t("ctaFacebook")}
                </Button>
              </a>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="secondary" className="glow-magenta">
                    <MessageCircle className="size-5" aria-hidden />
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
