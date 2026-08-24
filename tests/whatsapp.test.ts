import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGenericWhatsappUrl,
  buildTelUrl,
  buildWhatsappUrl,
  getSellerPhone,
  getSellerWhatsappNumber,
  type WhatsappProductInfo,
} from "@/lib/whatsapp";

const product: WhatsappProductInfo = {
  id: "acc-42",
  title_ar: "حساب ببجي",
  title_fr: "Compte PUBG",
  price: 89,
  currency: "TND",
};

function decodeText(url: string): string {
  const encoded = url.split("text=")[1];
  return decodeURIComponent(encoded ?? "");
}

describe("getSellerWhatsappNumber", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("strips everything but digits from the configured number", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+216 98 765 432");
    expect(getSellerWhatsappNumber()).toBe("21698765432");
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "tel:+216(71)-000-111");
    expect(getSellerWhatsappNumber()).toBe("21671000111");
  });

  it("returns null when unset or free of digits", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    expect(getSellerWhatsappNumber()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "no-digits-here");
    expect(getSellerWhatsappNumber()).toBeNull();
  });
});

describe("getSellerPhone", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps digits and the leading plus only", () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_PHONE", "+216 71 000 000");
    expect(getSellerPhone()).toBe("+21671000000");
    vi.stubEnv("NEXT_PUBLIC_SELLER_PHONE", "(+216) 25-000-000 ext.");
    expect(getSellerPhone()).toBe("+21625000000");
  });

  it("returns null when unset or without usable characters", () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_PHONE", "");
    expect(getSellerPhone()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_SELLER_PHONE", "abc def");
    expect(getSellerPhone()).toBeNull();
  });
});

describe("buildWhatsappUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when no WhatsApp number is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    expect(buildWhatsappUrl(product, "ar")).toBeNull();
  });

  it("builds a wa.me link carrying the Arabic pitch", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+216 98 765 432");
    const url = buildWhatsappUrl(product, "ar");
    expect(url).toMatch(/^https:\/\/wa\.me\/21698765432\?text=/);
    expect(decodeText(url!)).toBe(
      "مرحبًا، مهتم(ة) بالحساب: حساب ببجي (ID: acc-42) بثمن 89 د.ت. ممكن التفاصيل؟ شكرًا!",
    );
  });

  it("builds a wa.me link carrying the French pitch", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "21698765432");
    const url = buildWhatsappUrl(product, "fr");
    expect(url).toMatch(/^https:\/\/wa\.me\/21698765432\?text=/);
    expect(decodeText(url!)).toBe(
      "Bonjour, je suis intéressé(e) par le compte : Compte PUBG (ID: acc-42) au prix de 89 DT. Merci !",
    );
  });

  it("formats the price with the locale-aware formatter inside the message", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "21600000000");
    const euroProduct: WhatsappProductInfo = {
      ...product,
      price: 12.5,
      currency: "EUR",
    };
    const fr = buildWhatsappUrl(euroProduct, "fr");
    const ar = buildWhatsappUrl(euroProduct, "ar");
    expect(decodeText(fr!)).toContain("au prix de €12,50.");
    expect(decodeText(ar!)).toContain("بثمن €12,50.");
  });
});

describe("buildGenericWhatsappUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the localized generic inquiry message per locale", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "21612345678");
    expect(decodeText(buildGenericWhatsappUrl("ar")!)).toBe(
      "مرحبًا، نحب نستفسر على حسابات الغيمينغ المتوفرة.",
    );
    expect(decodeText(buildGenericWhatsappUrl("fr")!)).toBe(
      "Bonjour, je souhaite me renseigner sur les comptes de gaming disponibles.",
    );
  });

  it("returns null without a configured number", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "call-me");
    expect(buildGenericWhatsappUrl("fr")).toBeNull();
  });
});

describe("buildTelUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a tel link from the sanitized seller phone", () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_PHONE", "+216-71-234-567");
    expect(buildTelUrl()).toBe("tel:+21671234567");
  });

  it("returns null when the phone is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_PHONE", "");
    expect(buildTelUrl()).toBeNull();
  });
});
