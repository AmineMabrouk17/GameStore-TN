import { describe, expect, it, vi } from "vitest";
import type { D1Database, D1PreparedStatement } from "@/lib/db";
import {
  mapProductRow,
  parseImages,
  type ProductRecord,
} from "@/lib/repositories/products";
import * as categories from "@/lib/repositories/categories";

interface CapturedCall {
  sql: string;
  bindings: unknown[];
}

function makeDb(options: { row?: unknown; results?: unknown[] }): {
  db: D1Database;
  captured: CapturedCall;
} {
  const captured: CapturedCall = { sql: "", bindings: [] };
  const statement: D1PreparedStatement = {
    bind(...values: unknown[]) {
      captured.bindings = values;
      return statement;
    },
    first<T = Record<string, unknown>>() {
      return Promise.resolve((options.row as T | undefined) ?? null);
    },
    all<T = Record<string, unknown>>() {
      return Promise.resolve({
        results: (options.results ?? []) as T[],
        success: true,
        meta: {},
      });
    },
    run() {
      return Promise.resolve({ results: [], success: true, meta: {} });
    },
  };
  const db = {
    prepare(sql: string) {
      captured.sql = sql;
      return statement;
    },
    batch: vi.fn(),
  } as unknown as D1Database;
  return { db, captured };
}

function makeRow(overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id: "p-1",
    title_ar: "حساب فري فاير",
    title_fr: "Compte Free Fire",
    category_id: "cat-1",
    price: 45.5,
    currency: "TND",
    description_ar: null,
    description_fr: null,
    images: '["/games/ff.svg"]',
    status: "AVAILABLE",
    featured: 0,
    created_at: "2026-02-01 10:00:00",
    category_join_id: "cat-1",
    category_slug: "free-fire",
    category_name_ar: "فري فاير",
    category_name_fr: "Free Fire",
    ...overrides,
  };
}

describe("parseImages", () => {
  it("parses a JSON array of strings", () => {
    expect(parseImages('["/a.svg","https://x.com/b.png"]')).toEqual([
      "/a.svg",
      "https://x.com/b.png",
    ]);
  });

  it("falls back to [] on malformed JSON images", () => {
    expect(parseImages('["/a.svg"')).toEqual([]);
    expect(parseImages("{not-json")).toEqual([]);
  });

  it("falls back to [] when the column is not a JSON array", () => {
    expect(parseImages('{"a":1}')).toEqual([]);
    expect(parseImages('"just-a-string"')).toEqual([]);
  });

  it("drops non-string entries from the array", () => {
    expect(parseImages('["ok.svg",7,null,"also-ok"]')).toEqual([
      "ok.svg",
      "also-ok",
    ]);
  });

  it("treats empty and non-string columns as no images", () => {
    expect(parseImages("")).toEqual([]);
    expect(parseImages(null)).toEqual([]);
    expect(parseImages(undefined)).toEqual([]);
    expect(parseImages(123)).toEqual([]);
  });
});

describe("mapProductRow", () => {
  it("maps a joined row to the domain model", () => {
    const product = mapProductRow(makeRow({ featured: 1 }));
    expect(product).toEqual({
      id: "p-1",
      title_ar: "حساب فري فاير",
      title_fr: "Compte Free Fire",
      category_id: "cat-1",
      price: 45.5,
      currency: "TND",
      description_ar: null,
      description_fr: null,
      images: ["/games/ff.svg"],
      status: "AVAILABLE",
      featured: true,
      created_at: "2026-02-01 10:00:00",
      category: {
        id: "cat-1",
        slug: "free-fire",
        name_ar: "فري فاير",
        name_fr: "Free Fire",
      },
    });
  });

  it("falls back to [] when the images column holds malformed JSON", () => {
    const product = mapProductRow(makeRow({ images: "[broken" }));
    expect(product.images).toEqual([]);
  });

  it("coerces featured flags and keeps unknown currencies on TND", () => {
    expect(mapProductRow(makeRow({ featured: 0 })).featured).toBe(false);
    expect(mapProductRow(makeRow({ featured: null })).featured).toBe(false);
    expect(mapProductRow(makeRow({ featured: 2 })).featured).toBe(false);
    expect(mapProductRow(makeRow({ currency: "EUR" })).currency).toBe("EUR");
    expect(mapProductRow(makeRow({ currency: "GBP" })).currency).toBe("TND");
  });

  it("maps an orphaned product to a null category", () => {
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

  it.each(["PAUSED", "", "available"])(
    "throws on unexpected database status %j",
    (status) => {
      expect(() =>
        mapProductRow(makeRow({ status })),
      ).toThrow(/Unexpected product status in database/);
    },
  );
});

describe("categories.list", () => {
  it("maps rows into categories with product counts", async () => {
    const rows = [
      {
        id: "cat-1",
        name_ar: "فري فاير",
        name_fr: "Free Fire",
        slug: "free-fire",
        icon_url: null,
        product_count: 3,
      },
      {
        id: "cat-2",
        name_ar: "ببجي",
        name_fr: "PUBG",
        slug: "pubg",
        icon_url: "/icons/pubg.svg",
        product_count: 0,
      },
    ];
    const { db, captured } = makeDb({ results: rows });

    await expect(categories.list(db)).resolves.toEqual([
      {
        id: "cat-1",
        name_ar: "فري فاير",
        name_fr: "Free Fire",
        slug: "free-fire",
        icon_url: null,
        product_count: 3,
      },
      {
        id: "cat-2",
        name_ar: "ببجي",
        name_fr: "PUBG",
        slug: "pubg",
        icon_url: "/icons/pubg.svg",
        product_count: 0,
      },
    ]);
    expect(captured.sql).toContain("ORDER BY c.name_fr ASC");
  });
});

describe("categories.getBySlug", () => {
  it("binds the slug and maps the row", async () => {
    const row = {
      id: "cat-2",
      name_ar: "ببجي",
      name_fr: "PUBG",
      slug: "pubg",
      icon_url: "/icons/pubg.svg",
    };
    const { db, captured } = makeDb({ row });

    await expect(categories.getBySlug("pubg", db)).resolves.toEqual({
      id: "cat-2",
      name_ar: "ببجي",
      name_fr: "PUBG",
      slug: "pubg",
      icon_url: "/icons/pubg.svg",
    });
    expect(captured.sql).toBe(
      "SELECT id, name_ar, name_fr, slug, icon_url FROM categories WHERE slug = ?",
    );
    expect(captured.bindings).toEqual(["pubg"]);
  });

  it("returns null for an unknown slug", async () => {
    const { db } = makeDb({ row: null });
    await expect(categories.getBySlug("ghost", db)).resolves.toBeNull();
  });
});

describe("categories.create", () => {
  it("binds every field, defaults icon_url to null, and returns the domain object", async () => {
    const { db, captured } = makeDb({});
    const input = { name_ar: "ببجي", name_fr: "PUBG", slug: "pubg" };

    await expect(categories.create(input, db, "cat-fixed")).resolves.toEqual({
      id: "cat-fixed",
      name_ar: "ببجي",
      name_fr: "PUBG",
      slug: "pubg",
      icon_url: null,
    });
    expect(captured.sql).toContain("INSERT INTO categories");
    expect(captured.bindings).toEqual([
      "cat-fixed",
      "ببجي",
      "PUBG",
      "pubg",
      null,
    ]);
  });

  it("keeps a provided icon_url and honors an explicit id", async () => {
    const { db, captured } = makeDb({});
    const input = {
      name_ar: "ببجي",
      name_fr: "PUBG",
      slug: "pubg",
      icon_url: "/icons/pubg.svg",
    };

    await expect(categories.create(input, db, "cat-9")).resolves.toEqual({
      id: "cat-9",
      name_ar: "ببجي",
      name_fr: "PUBG",
      slug: "pubg",
      icon_url: "/icons/pubg.svg",
    });
    expect(captured.bindings[4]).toBe("/icons/pubg.svg");
  });

  it("generates an id when none is provided", async () => {
    const { db, captured } = makeDb({});
    const input = { name_ar: "ببجي", name_fr: "PUBG", slug: "pubg" };
    const created = await categories.create(input, db);
    expect(created.id).toBe(captured.bindings[0]);
    expect(captured.bindings[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
