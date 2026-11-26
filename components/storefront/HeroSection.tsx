import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, MessageCircle } from "lucide-react";
import FacebookIcon from "@/components/FacebookIcon";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { FadeIn } from "@/components/animations/FadeIn";
import { buildGenericWhatsappUrl, buildWhatsappUrl } from "@/lib/whatsapp";
import { FACEBOOK_PAGE_URL } from "@/lib/facebook";
import { formatPrice } from "@/lib/format";
import type { Locale, ProductWithCategory } from "@/types";

interface HeroSectionProps {
  stats: { available: number; categories: number; sold: number };
  product?: ProductWithCategory | null;
}

export default async function HeroSection({ stats, product }: HeroSectionProps) {
  const t = await getTranslations("hero");
  const tCatalog = await getTranslations("catalog");
  const tProduct = await getTranslations("product");
  const locale = ((await getLocale()) as Locale) ?? "ar";
  const whatsappHref = buildGenericWhatsappUrl(locale);
  const buyHref = product ? buildWhatsappUrl(product, locale) : null;

  const title = product
    ? locale === "ar"
      ? product.title_ar
      : product.title_fr
    : null;
  const categoryName = product?.category
    ? locale === "ar"
      ? product.category.name_ar
      : product.category.name_fr
    : null;
  const cover = product?.images[0];

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(60%_60%_at_70%_0%,rgb(255_54_224/0.16),transparent_70%),radial-gradient(50%_50%_at_20%_10%,rgb(62_232_255/0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:py-20">
        <div>
          <FadeIn>
            <h1 className="text-5xl font-black leading-[1.12] tracking-normal sm:text-6xl lg:text-7xl">
              <span className="text-primary">{t("titleLine1")}</span>
              <br />
              {t("titleLine2")}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("subtitle")}
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/catalog">
                <Button size="lg">
                  {t("ctaBrowse")}
                  <ArrowLeft className="size-4" aria-hidden />
                </Button>
              </Link>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline">
                    <MessageCircle className="size-4" aria-hidden />
                    {t("ctaSell")}
                  </Button>
                </a>
              )}
              <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="ghost">
                  <FacebookIcon className="size-4" aria-hidden />
                  {t("ctaFacebook")}
                </Button>
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-7 flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary shadow-[0_0_0_4px_rgb(204_255_51/0.12)]" />
              {stats.available} {t("statsAvailable")} · {stats.categories}{" "}
              {t("statsCategories")}
            </p>
          </FadeIn>
        </div>

        {product && title && (
          <FadeIn delay={0.15}>
            <aside className="rounded-[20px] border border-[rgb(190_185_225/0.28)] bg-gradient-to-b from-secondary to-card p-3.5 shadow-[0_40px_80px_-40px_#000]">
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                <Link
                  href={`/product/${product.id}`}
                  className="relative block aspect-[16/10] overflow-hidden"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={`${title} — ${tProduct("imageAlt")}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-4xl font-black text-white/10">
                      {title.slice(0, 2)}
                    </div>
                  )}
                  <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {categoryName ?? tProduct("category")}
                  </span>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-black leading-snug">{title}</h2>
                    <p className="shrink-0 font-mono text-xl font-semibold">
                      {formatPrice(product.price, product.currency, locale)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full border border-[rgb(204_255_51/0.35)] bg-primary/5 px-2.5 py-1 text-primary">
                      {product.status === "AVAILABLE"
                        ? tCatalog("available")
                        : product.status === "RESERVED"
                          ? tCatalog("reserved")
                          : tCatalog("sold")}
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-1">
                      {categoryName ?? tProduct("category")}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {buyHref ? (
                      <a
                        href={buyHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <MessageCircle className="size-4" aria-hidden />
                          {t("buyWhatsapp")}
                        </Button>
                      </a>
                    ) : null}
                    <Link href={`/product/${product.id}`}>
                      <Button size="sm" variant="secondary">
                        {t("viewAccount")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
