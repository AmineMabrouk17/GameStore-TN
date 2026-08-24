import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats whole TND amounts per locale", () => {
    expect(formatPrice(89, "TND", "ar")).toBe("89 د.ت");
    expect(formatPrice(89, "TND", "fr")).toBe("89 DT");
    expect(formatPrice(0, "TND", "fr")).toBe("0 DT");
  });

  it("uses two fraction digits for fractional amounts in both locales", () => {
    expect(formatPrice(12.5, "TND", "ar")).toBe("12,50 د.ت");
    expect(formatPrice(12.5, "TND", "fr")).toBe("12,50 DT");
    expect(formatPrice(0.99, "EUR", "ar")).toBe("€0,99");
    expect(formatPrice(0.99, "EUR", "fr")).toBe("€0,99");
  });

  it("groups thousands with the locale separators", () => {
    expect(formatPrice(1500, "TND", "ar")).toBe("1.500 د.ت");
    expect(formatPrice(1234.5, "TND", "fr")).toMatch(/^1\s234,50 DT$/);
    expect(formatPrice(2500, "EUR", "ar")).toBe("€2.500");
  });

  it("prefixes EUR regardless of locale and suffixes TND labels per locale", () => {
    expect(formatPrice(60, "EUR", "ar")).toBe("€60");
    expect(formatPrice(60, "EUR", "fr")).toBe("€60");
    expect(formatPrice(60, "TND", "ar").endsWith("د.ت")).toBe(true);
    expect(formatPrice(60, "TND", "fr").endsWith("DT")).toBe(true);
  });

  it("keeps latin digits for ar via the ar-TN number system", () => {
    const formatted = formatPrice(765.25, "TND", "ar");
    expect(formatted).toMatch(/^[0-9]+(?:,[0-9]{2})? د\.ت$/);
    expect(formatted).not.toMatch(/[٠-٩]/);
  });
});
