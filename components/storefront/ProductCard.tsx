"use client";

import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, Phone, Star } from "lucide-react";
import FacebookIcon from "@/components/FacebookIcon";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { TiltCard } from "@/components/animations/TiltCard";
import { formatPrice } from "@/lib/format";
import { buildTelUrl, buildWhatsappUrl } from "@/lib/whatsapp";
import { FACEBOOK_PAGE_URL } from "@/lib/facebook";
import type { Locale, ProductStatus, ProductWithCategory } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ProductStatus, string> = {
  AVAILABLE: "border-primary/40 bg-primary/10 text-primary",
  RESERVED: "border-warning/40 bg-warning/10 text-warning",
  SOLD: "border-danger/40 bg-danger/10 text-danger",
};

interface ProductCardProps {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("catalog");
  const tp = useTranslations("product");
  const tc = useTranslations("common");
  const locale = (useLocale() as Locale) ?? "ar";

  const title = locale === "ar" ? product.title_ar : product.title_fr;
  const categoryName = product.category
    ? locale === "ar"
      ? product.category.name_ar
      : product.category.name_fr
    : null;
  const isSold = product.status === "SOLD";
  const whatsappHref = buildWhatsappUrl(product, locale);
  const telHref = buildTelUrl();
  const cover = product.images[0];
  const statusLabel =
    product.status === "AVAILABLE"
      ? t("available")
      : product.status === "RESERVED"
        ? t("reserved")
        : t("sold");

  return (
    <TiltCard className="h-full">
      <article
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50",
          isSold && "opacity-60",
        )}
      >
        <Link
          href={`/product/${product.id}`}
          className="relative block h-48 overflow-hidden bg-black/50"
        >
          {cover ? (
            <img
              src={cover}
              alt={`${title} — ${tp("imageAlt")}`}
              loading="lazy"
              className={cn(
                "size-full object-cover transition-transform duration-500 group-hover:scale-105",
                isSold && "grayscale",
              )}
            />
          ) : (
            <div className="grid size-full place-items-center text-4xl font-black text-white/10">
              {title.slice(0, 2)}
            </div>
          )}

          {/* legibility scrim: top for the price, bottom for the game label */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/75 via-black/10 to-black/90" />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="font-mono text-4xl font-bold leading-none tracking-tight text-primary drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
              {formatPrice(product.price, product.currency, locale)}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                STATUS_STYLE[product.status],
              )}
            >
              {statusLabel}
            </span>
          </div>

          <div className="absolute bottom-3 start-3 flex items-center gap-2">
            <span className="rounded border border-primary/30 bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
              {categoryName ?? tp("category")}
            </span>
            {product.featured && (
              <Star
                className="size-4 fill-violet-400 text-violet-400 drop-shadow-[0_0_6px_rgb(139_92_246/0.8)]"
                aria-label="featured"
              />
            )}
          </div>
        </Link>

        <h3 className="line-clamp-2 px-4 pt-3 text-sm font-black leading-snug sm:text-base">
          <Link href={`/product/${product.id}`}>{title}</Link>
        </h3>

        <dl className="mx-4 mt-3 grid grid-cols-2 border-y border-border">
          <div className="border-e border-border py-2 text-center">
            <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-500">
              {tp("category")}
            </dt>
            <dd className="mt-0.5 truncate text-[11px] font-semibold">
              {categoryName ?? "—"}
            </dd>
          </div>
          <div className="py-2 text-center">
            <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-500">
              {tp("status")}
            </dt>
            <dd className="mt-0.5 text-[11px] font-semibold">{statusLabel}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center gap-2 p-3">
          {!isSold && whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" className="w-full">
                <MessageCircle className="size-4" aria-hidden />
                {tc("whatsapp")}
              </Button>
            </a>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              {tp("soldOut")}
            </Button>
          )}
          {!isSold && (
            <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary" aria-label={tc("facebook")}>
                <FacebookIcon className="size-4" aria-hidden />
              </Button>
            </a>
          )}
          {!isSold && telHref && (
            <a href={telHref}>
              <Button size="sm" variant="secondary" aria-label={tc("call")}>
                <Phone className="size-4" aria-hidden />
              </Button>
            </a>
          )}
        </div>
      </article>
    </TiltCard>
  );
}
