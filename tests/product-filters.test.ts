import { describe, expect, it } from "vitest";
import { buildProductFilters } from "@/lib/product-filters";
import type { ProductSort } from "@/types";

describe("buildProductFilters", () => {
  it("maps every filter to placeholder conditions with bound params", () => {
    const built = buildProductFilters({
      categorySlug: "free-fire",
      status: "RESERVED",
      minPrice: 15,
      maxPrice: 90,
      featured: true,
      q: "pes",
      sort: "price_desc",
    });
    expect(built.whereSql).toBe(
      "c.slug = ? AND p.status = ? AND p.price >= ? AND p.price <= ? AND p.featured = ? AND (p.title_ar LIKE ? ESCAPE '\\' OR p.title_fr LIKE ? ESCAPE '\\' OR p.description_ar LIKE ? ESCAPE '\\' OR p.description_fr LIKE ? ESCAPE '\\')",
    );
    expect(built.params).toEqual([
      "free-fire",
      "RESERVED",
      15,
      90,
      1,
      "%pes%",
      "%pes%",
      "%pes%",
      "%pes%",
    ]);
    expect(built.orderBySql).toBe("p.price DESC");
  });

  it("keeps injection payloads out of the SQL text", () => {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE products; --",
      "free-fire' OR c.slug LIKE '%",
      "%_\\%",
    ];
    for (const payload of payloads) {
      const built = buildProductFilters({
        q: payload,
        categorySlug: payload,
        status: "AVAILABLE",
      });
      expect(built.whereSql).not.toContain(payload);
      expect(built.whereSql.match(/\?/g)).toHaveLength(6);
      expect(built.params[0]).toBe(payload);
      const likeParams = built.params.slice(2);
      expect(likeParams).toEqual(
        Array(4).fill(`%${payload.replace(/[\\%_]/g, "\\$&")}%`),
      );
    }
  });

  it("escapes LIKE wildcards in the search term", () => {
    const built = buildProductFilters({ q: "50%_off\\final" });
    expect(built.whereSql).not.toContain("50%_off");
    expect(built.params).toEqual(Array(4).fill("%50\\%\\_off\\\\final%"));
  });

  it("binds featured as 1/0 instead of embedding a boolean literal", () => {
    expect(buildProductFilters({ featured: true }).params).toEqual([1]);
    expect(buildProductFilters({ featured: false }).params).toEqual([0]);
    expect(buildProductFilters({ featured: true }).whereSql).toBe(
      "p.featured = ?",
    );
  });

  it("ignores an empty search term", () => {
    const built = buildProductFilters({ q: "" });
    expect(built.whereSql).toBe("");
    expect(built.params).toEqual([]);
  });

  it.each([
    ["newest", "p.created_at DESC"],
    ["price_asc", "p.price ASC"],
    ["price_desc", "p.price DESC"],
  ])("maps sort %s to ORDER BY %s", (sort, expected) => {
    expect(buildProductFilters({ sort: sort as ProductSort }).orderBySql).toBe(
      expected,
    );
  });

  it("falls back to newest for unknown or missing sorts", () => {
    expect(
      buildProductFilters({ sort: "p.id; DROP TABLE x" as never }).orderBySql,
    ).toBe("p.created_at DESC");
    expect(buildProductFilters({}).orderBySql).toBe("p.created_at DESC");
  });

  it("returns an empty where clause and no params for an empty query", () => {
    const built = buildProductFilters({});
    expect(built.whereSql).toBe("");
    expect(built.params).toEqual([]);
  });
});
