import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, CalendarDays, MessageCircle, Phone, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getDb } from "@/lib/db";
import { getById, list as listProducts } from "@/lib/repositories/products";
import { formatDate, formatPrice } from "@/lib/format";
import { buildTelUrl, buildWhatsappUrl } from "@/lib/whatsapp";
import { Badge, Button, Separator } from "@/components/ui";
import { FadeIn } from "@/components/animations/FadeIn";
import ProductGallery from "@/components/storefront/ProductGallery";
import ProductCard from "@/components/storefront/ProductCard";
import type { Locale } from "@/types";
import { getMetadataBase, localeAlternates, openGraphLocale, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

async function loadProduct(id: string) {
  const db = await getDb();
  return getById(id, db);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale = (rawLocale === "fr" ? "fr" : "ar") as Locale;
  let product = null;
  try {
    product = await loadProduct(id);
  } catch {
    return {};
  }
  if (!product) return {};

  const isAr = locale === "ar";
  const title = isAr ? product.title_ar : product.title_fr;
  const description =
    (isAr ? product.description_ar : product.description_fr) ??
    (isAr ? product.title_ar : product.title_fr);
  const og = openGraphLocale(locale);
  const images = product.images.length > 0 ? [{ url: product.images[0] }] : undefined;

  return {
    metadataBase: getMetadataBase(),
    title,
    description: description.slice(0, 160),
    alternates: localeAlternates(locale, `/product/${product.id}`),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: og.locale,
      alternateLocale: og.alternate,
      url: `/${locale}/product/${product.id}`,
      title,
      description: description.slice(0, 160),
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description: description.slice(0, 160),
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale = (rawLocale === "fr" ? "fr" : "ar") as Locale;
  const t = await getTranslations("catalog");
  const tp = await getTranslations("product");

  const product = await loadProduct(id);
  if (!product) notFound();

  const db = await getDb();
  const relatedResult = await listProducts(
    product.category
      ? { categorySlug: product.category.slug, pageSize: 5 }
      : { pageSize: 5 },
    db,
  );
  const related = relatedResult.items.filter((item) => item.id !== product.id).slice(0, 4);

  const isAr = locale === "ar";
  const title = isAr ? product.title_ar : product.title_fr;
  const description =
    (isAr ? product.description_ar : product.description_fr) ?? "";
  const categoryName = product.category
    ? isAr
      ? product.category.name_ar
      : product.category.name_fr
    : tp("category");

  const isSold = product.status === "SOLD";
  const whatsappHref = buildWhatsappUrl(product, locale);
  const telHref = buildTelUrl();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-400 transition-colors hover:text-primary"
      >
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        {tp("backToCatalog")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <FadeIn>
          <ProductGallery images={product.images} title={title} />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isSold ? "danger" : product.status === "RESERVED" ? "warning" : "success"}>
              {isSold ? t("sold") : product.status === "RESERVED" ? t("reserved") : t("available")}
            </Badge>
            <Badge variant="secondary">
              <Tag className="me-1 size-3" aria-hidden />
              {categoryName}
            </Badge>
            {product.featured && <Badge variant="featured">★</Badge>}
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>

          <p className="mt-4 text-4xl font-black text-cyan-300 glow-cyan rounded-xl inline-block px-2">
            {formatPrice(product.price, product.currency, locale)}
          </p>

          <Separator className="my-6" />

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-neutral-400">{tp("status")}</dt>
              <dd className="font-black">{isSold ? t("sold") : t("available")}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-neutral-400">{tp("category")}</dt>
              <dd className="font-black">{categoryName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-1.5 font-bold text-neutral-400">
                <CalendarDays className="size-4" aria-hidden />
                {tp("addedOn")}
              </dt>
              <dd className="font-black">{formatDate(product.created_at, locale)}</dd>
            </div>
          </dl>

          <Separator className="my-6" />

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isSold && whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full glow-cyan">
                  <MessageCircle className="size-5" aria-hidden />
                  {tp("contactWhatsapp")}
                </Button>
              </a>
            )}
            {!isSold && telHref && (
              <a href={telHref} className="flex-1">
                <Button size="lg" variant="secondary" className="w-full glow-magenta">
                  <Phone className="size-5" aria-hidden />
                  {tp("callToBuy")}
                </Button>
              </a>
            )}
            {isSold && (
              <div className="glass flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-lg font-black text-rose-300">
                <BadgeCheck className="size-5" aria-hidden />
                {tp("soldOut")}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {description && (
        <section className="mt-14 max-w-3xl">
          <h2 className="text-xl font-black">{tp("description")}</h2>
          <p className="glass mt-4 whitespace-pre-line rounded-2xl p-6 text-sm leading-relaxed text-neutral-200">
            {description}
          </p>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-black">{tp("related")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
