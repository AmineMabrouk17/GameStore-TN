import { describe, expect, it } from "vitest";
import { formatDate, formatPrice } from "@/lib/format";
import { buildProductFilters } from "@/lib/product-filters";
import { mapProductRow, parseImages } from "@/lib/repositories/products";
import type { ProductRecord } from "@/lib/repositories/products";
import { productQuerySchema } from "@/lib/validation";

function makeRow(overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id: "p1",
    title_ar: "حساب",
    title_fr: "Compte",
    category_id: "cat-1",
    price: 89,
    currency: "TND",
    description_ar: null,
    description_fr: null,
    images: "[]",
    status: "AVAILABLE",
    featured: 0,
    created_at: "2026-01-01 00:00:00",
    category_join_id: "cat-1",
    category_slug: "free-fire",
    category_name_ar: "فري فاير",
    category_name_fr: "Free Fire",
    ...overrides,
  };
}

describe("parseImages", () => {
  it("parses a valid JSON images column", () => {
    expect(parseImages('["/games/steam.svg","/games/steam-2.svg"]')).toEqual([
      "/games/steam.svg",
      "/games/steam-2.svg",
    ]);
  });

  it("falls back to [] on malformed JSON", () => {
    expect(parseImages("{not-json")).toEqual([]);
  });

  it("falls back to [] when JSON is not an array and drops non-string entries", () => {
    expect(parseImages('{"a":1}')).toEqual([]);
    expect(parseImages('["ok.svg",42,null]')).toEqual(["ok.svg"]);
  });

  it("handles empty and non-string input", () => {
    expect(parseImages("")).toEqual([]);
    expect(parseImages(null)).toEqual([]);
    expect(parseImages(42)).toEqual([]);
  });
});

describe("mapProductRow", () => {
  it("maps a joined row to the domain model with boolean featured and category", () => {
    const product = mapProductRow(makeRow({ images: '["/a.svg"]', featured: 1 }));
    expect(product.images).toEqual(["/a.svg"]);
    expect(product.featured).toBe(true);
    expect(product.status).toBe("AVAILABLE");
    expect(product.currency).toBe("TND");
    expect(product.category).toEqual({
      id: "cat-1",
      slug: "free-fire",
      name_ar: "فري فاير",
      name_fr: "Free Fire",
    });
  });

  it("maps an orphaned product (deleted category) to null category", () => {
    const product = mapProductRow(
      makeRow({
        category_join_id: null,
        category_slug: null,
        category_name_ar: null,
        category_name_fr: null,
      }),
    );
    expect(product.category).toBeNull();
  });
});

describe("buildProductFilters", () => {
  it("passes all user input as bound params, never inside SQL text", () => {
    const malicious = "' OR 1=1; DROP TABLE products; -- %_\\";
    const built = buildProductFilters({
      q: malicious,
      categorySlug: "free-fire",
      status: "AVAILABLE",
      minPrice: 10,
      maxPrice: 200,
      featured: true,
    });
    expect(built.whereSql).not.toContain(malicious);
    expect(built.whereSql).toMatch(/^c\.slug = \? AND p\.status = \? AND p\.price >= \? AND p\.price <= \? AND p\.featured = \? AND \(p\.title_ar LIKE \? ESCAPE '\\'/);
    expect(built.params).toEqual([
      "free-fire",
      "AVAILABLE",
      10,
      200,
      1,
      `%${malicious.replace(/[\\%_]/g, "\\$&")}%`,
      `%${malicious.replace(/[\\%_]/g, "\\$&")}%`,
      `%${malicious.replace(/[\\%_]/g, "\\$&")}%`,
      `%${malicious.replace(/[\\%_]/g, "\\$&")}%`,
    ]);
  });

  it("whitelists ORDER BY and falls back to newest for unknown sort values", () => {
    expect(buildProductFilters({ sort: "price_asc" }).orderBySql).toBe("p.price ASC");
    expect(
      buildProductFilters({ sort: "p.price; DROP TABLE x" as never }).orderBySql,
    ).toBe("p.created_at DESC");
  });

  it("returns empty where clause for an empty query", () => {
    const built = buildProductFilters({});
    expect(built.whereSql).toBe("");
    expect(built.orderBySql).toBe("p.created_at DESC");
    expect(built.params).toEqual([]);
  });
});

describe("productQuerySchema coercion", () => {
  it("coerces string query params into numbers/booleans", () => {
    const parsed = productQuerySchema.parse({
      minPrice: "25.5",
      page: "3",
      pageSize: "24",
      featured: "true",
      q: " free fire ",
    });
    expect(parsed.minPrice).toBe(25.5);
    expect(parsed.page).toBe(3);
    expect(parsed.pageSize).toBe(24);
    expect(parsed.featured).toBe(true);
    expect(parsed.q).toBe("free fire");
    expect(parsed.sort).toBe("newest");
  });

  it("rejects non-positive prices and min > max", () => {
    expect(productQuerySchema.safeParse({ minPrice: "0" }).success).toBe(false);
    expect(
      productQuerySchema.safeParse({ minPrice: "50", maxPrice: "10" }).success,
    ).toBe(false);
  });
});

describe("formatPrice", () => {
  it("formats TND per locale", () => {
    expect(formatPrice(89, "TND", "ar")).toBe("89 د.ت");
    expect(formatPrice(89, "TND", "fr")).toBe("89 DT");
  });

  it("prefixes EUR and keeps latin digits in ar-TN", () => {
    expect(formatPrice(12, "EUR", "fr")).toBe("€12");
    expect(formatPrice(12.5, "EUR", "fr")).toBe("€12,50");
    expect(formatPrice(1500, "TND", "ar")).toBe("1.500 د.ت");
  });
});

describe("formatDate", () => {
  it("is locale-aware", () => {
    const iso = "2026-03-07T12:00:00Z";
    expect(formatDate(iso, "fr")).toContain("2026");
    expect(formatDate(new Date(iso), "fr")).toBe(formatDate(iso, "fr"));
    expect(() => formatDate("not-a-date", "fr")).toThrow(RangeError);
  });
});
