import { formatPrice } from "@/lib/format";
import type { Currency, Locale } from "@/types";

export interface WhatsappProductInfo {
  id: string;
  title_ar: string;
  title_fr: string;
  price: number;
  currency: Currency;
}

const MESSAGES: Record<Locale, (info: WhatsappProductInfo, priceLabel: string) => string> = {
  ar: (info, priceLabel) =>
    `مرحبًا، مهتم(ة) بالحساب: ${info.title_ar} (ID: ${info.id}) بثمن ${priceLabel}. ممكن التفاصيل؟ شكرًا!`,
  fr: (info, priceLabel) =>
    `Bonjour, je suis intéressé(e) par le compte : ${info.title_fr} (ID: ${info.id}) au prix de ${priceLabel}. Merci !`,
};

function sanitizeNumber(value: string | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function getSellerWhatsappNumber(): string | null {
  return sanitizeNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
}

export function getSellerPhone(): string | null {
  const raw = process.env.NEXT_PUBLIC_SELLER_PHONE;
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.length > 0 ? digits : null;
}

export function buildWhatsappUrl(
  product: WhatsappProductInfo,
  locale: Locale,
): string | null {
  const number = getSellerWhatsappNumber();
  if (!number) return null;
  const priceLabel = formatPrice(product.price, product.currency, locale);
  const message = MESSAGES[locale](product, priceLabel);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildTelUrl(): string | null {
  const phone = getSellerPhone();
  if (!phone) return null;
  return `tel:${phone}`;
}

const GENERIC_MESSAGES: Record<Locale, string> = {
  ar: "مرحبًا، نحب نستفسر على حسابات الغيمينغ المتوفرة.",
  fr: "Bonjour, je souhaite me renseigner sur les comptes de gaming disponibles.",
};

export function buildGenericWhatsappUrl(locale: Locale): string | null {
  const number = getSellerWhatsappNumber();
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(GENERIC_MESSAGES[locale])}`;
}
