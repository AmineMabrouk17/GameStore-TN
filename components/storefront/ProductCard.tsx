"use client";

import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, Clock, MessageCircle, Phone, Star } from "lucide-react";
import FacebookIcon from "@/components/FacebookIcon";
import { Link } from "@/i18n/navigation";
import { Badge, Button } from "@/components/ui";
import { TiltCard } from "@/components/animations/TiltCard";
import { formatPrice } from "@/lib/format";
import { buildTelUrl, buildWhatsappUrl } from "@/lib/whatsapp";
import { FACEBOOK_PAGE_URL } from "@/lib/facebook";
import type { Locale, ProductStatus, ProductWithCategory } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<ProductStatus, "success" | "warning" | "danger"> = {
  AVAILABLE: "success",
  RESERVED: "warning",
  SOLD: "danger",
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

  return (
    <TiltCard className="h-full">
      <article
        className={cn(
          "glass group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all hover:border-primary/40 hover:glow-cyan",
          isSold && "opacity-60 saturate-50",
        )}
      >
        <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-black/50">
          {cover ? (
            <img
              src={cover}
              alt={`${title} — ${tp("imageAlt")}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-4xl font-black text-white/10">
              {title.slice(0, 2)}
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge variant={STATUS_BADGE[product.status]}>
              {product.status === "AVAILABLE"
                ? t("available")
                : product.status === "RESERVED"
                  ? t("reserved")
                  : t("sold")}
            </Badge>
            {product.featured && (
              <span title={t("sortNewest")}>
                <Star className="size-5 fill-violet-400 text-violet-400 drop-shadow-[0_0_6px_rgb(139_92_246/0.8)]" aria-label="featured" />
              </span>
            )}
          </div>
          {isSold && (
            <span className="absolute inset-0 grid place-items-center">
              <BadgeCheck className="size-10 rotate-[-12deg] text-white drop-shadow-lg" aria-hidden />
              <span className="mt-2 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                {tp("soldOut")}
              </span>
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-black leading-snug sm:text-base">
              <Link href={`/product/${product.id}`}>{title}</Link>
            </h3>
            <p className="shrink-0 text-base font-black text-cyan-300">
              {formatPrice(product.price, product.currency, locale)}
            </p>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Clock className="size-3.5" aria-hidden />
            {categoryName ?? tp("category")}
          </p>

          <div className="mt-auto flex items-center gap-2">
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
        </div>
      </article>
    </TiltCard>
  );
}
