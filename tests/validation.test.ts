import { describe, expect, it } from "vitest";
import {
  categoryCreateSchema,
  loginCredentialsSchema,
  productCreateSchema,
  productQuerySchema,
  productUpdateSchema,
} from "@/lib/validation";

const VALID_IMAGE = "https://cdn.example.com/games/pes.webp";

const validProduct = {
  title_ar: "حساب PES 2026",
  title_fr: "Compte PES 2026",
  category_id: "cat-pes",
  price: 120,
  currency: "TND",
  status: "AVAILABLE",
};

describe("productCreateSchema", () => {
  it("accepts a fully valid payload", () => {
    const parsed = productCreateSchema.parse({
      ...validProduct,
      description_ar: null,
      images: [VALID_IMAGE, "/games/fifa.svg"],
      featured: true,
    });
    expect(parsed.status).toBe("AVAILABLE");
    expect(parsed.images).toHaveLength(2);
    expect(parsed.featured).toBe(true);
  });

  it("defaults images to [] and featured to false", () => {
    const parsed = productCreateSchema.parse(validProduct);
    expect(parsed.images).toEqual([]);
    expect(parsed.featured).toBe(false);
  });

  it("accepts titles of exactly 200 chars", () => {
    expect(
      productCreateSchema.safeParse({
        ...validProduct,
        title_ar: "أ".repeat(200),
      }).success,
    ).toBe(true);
  });

  it.each([
    ["missing title_ar", { title_ar: undefined }],
    ["empty title_ar", { title_ar: "" }],
    ["title_ar over 200 chars", { title_ar: "أ".repeat(201) }],
    ["empty title_fr", { title_fr: "" }],
    ["missing category_id", { category_id: undefined }],
    ["zero price", { price: 0 }],
    ["negative price", { price: -10 }],
    ["string price", { price: "120" }],
    ["unknown currency", { currency: "USD" }],
    ["lowercase status", { status: "available" }],
    ["invalid status", { status: "ARCHIVED" }],
    ["image without protocol or slash", { images: ["example.com/a.png"] }],
    ["javascript scheme image", { images: ["javascript:alert(1)"] }],
    ["ftp scheme image", { images: ["ftp://cdn.example.com/a.png"] }],
    ["image containing spaces", { images: ["https://cdn.example.com/a b.png"] }],
    [
      "over-long image ref",
      { images: [`/${"a".repeat(2048)}`] },
    ],
  ] as Array<[string, Record<string, unknown>]>)(
    "rejects %s",
    (_name, patch) => {
      expect(
        productCreateSchema.safeParse({ ...validProduct, ...patch }).success,
      ).toBe(false);
    },
  );
});

describe("product images array limits", () => {
  const sixImages = Array.from({ length: 6 }, (_, i) => `/games/${i}.svg`);
  const sevenImages = [...sixImages, "/games/extra.svg"];

  it("accepts up to 6 image references on create", () => {
    expect(
      productCreateSchema.safeParse({ ...validProduct, images: sixImages })
        .success,
    ).toBe(true);
  });

  it("rejects more than 6 image references on create and update", () => {
    expect(
      productCreateSchema.safeParse({ ...validProduct, images: sevenImages })
        .success,
    ).toBe(false);
    expect(productUpdateSchema.safeParse({ images: sevenImages }).success).toBe(
      false,
    );
  });

  it("accepts a 2048-char image reference and rejects 2049", () => {
    const max = `/${"a".repeat(2047)}`;
    expect(
      productCreateSchema.safeParse({ ...validProduct, images: [max] }).success,
    ).toBe(true);
    expect(
      productCreateSchema.safeParse({ ...validProduct, images: [`${max}a`] })
        .success,
    ).toBe(false);
  });

  it("accepts https and root-relative references", () => {
    expect(
      productUpdateSchema.safeParse({
        images: ["https://x.com/a.png", "/b.svg"],
      }).success,
    ).toBe(true);
  });
});

describe("productUpdateSchema", () => {
  it("accepts an empty patch", () => {
    expect(productUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial fields with null descriptions", () => {
    expect(
      productUpdateSchema.safeParse({ price: 55.5, description_fr: null })
        .success,
    ).toBe(true);
  });

  it.each([
    ["bad status", { status: "PAUSED" }],
    ["bad currency", { currency: "USD" }],
    ["non-positive price", { price: 0 }],
    ["non-boolean featured", { featured: "yes" }],
    ["non-array images", { images: "/a.svg" }],
  ] as Array<[string, Record<string, unknown>]>)("rejects %s", (_name, patch) => {
    expect(productUpdateSchema.safeParse(patch).success).toBe(false);
  });
});

describe("categoryCreateSchema", () => {
  const validCategory = {
    name_ar: "فري فاير",
    name_fr: "Free Fire",
    slug: "free-fire",
  };

  it("accepts a valid category with and without icon_url", () => {
    expect(categoryCreateSchema.safeParse(validCategory).success).toBe(true);
    expect(
      categoryCreateSchema.safeParse({ ...validCategory, icon_url: null })
        .success,
    ).toBe(true);
    expect(
      categoryCreateSchema.safeParse({ ...validCategory, icon_url: VALID_IMAGE })
        .success,
    ).toBe(true);
  });

  it("accepts digit slugs at boundaries of length", () => {
    expect(
      categoryCreateSchema.safeParse({
        ...validCategory,
        slug: `${"a".repeat(98)}-9`,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["uppercase slug", { slug: "Free-Fire" }],
    ["slug with spaces", { slug: "free fire" }],
    ["leading-hyphen slug", { slug: "-free-fire" }],
    ["trailing-hyphen slug", { slug: "free-fire-" }],
    ["consecutive-hyphen slug", { slug: "free--fire" }],
    ["underscore slug", { slug: "free_fire" }],
    ["empty slug", { slug: "" }],
    ["slug over 100 chars", { slug: `${"a".repeat(99)}-bb` }],
    ["empty name_ar", { name_ar: "" }],
    ["name over 100 chars", { name_fr: "F".repeat(101) }],
    ["invalid icon_url", { icon_url: "not-a-url" }],
  ] as Array<[string, Record<string, unknown>]>)(
    "rejects %s",
    (_name, patch) => {
      expect(
        categoryCreateSchema.safeParse({ ...validCategory, ...patch }).success,
      ).toBe(false);
    },
  );
});

describe("loginCredentialsSchema", () => {
  it("accepts credentials at the accepted boundaries", () => {
    expect(
      loginCredentialsSchema.safeParse({ username: "adm", password: "12345678" })
        .success,
    ).toBe(true);
    expect(
      loginCredentialsSchema.safeParse({
        username: "a".repeat(64),
        password: "p".repeat(128),
      }).success,
    ).toBe(true);
  });

  it.each([
    ["short username", { username: "ab" }],
    ["long username", { username: "a".repeat(65) }],
    ["short password", { password: "1234567" }],
    ["long password", { password: "p".repeat(129) }],
    ["non-string username", { username: 42 }],
    ["non-string password", { password: null }],
  ] as Array<[string, Record<string, unknown>]>)("rejects %s", (_name, patch) => {
    expect(
      loginCredentialsSchema.safeParse({
        username: "admin",
        password: "password123",
        ...patch,
      }).success,
    ).toBe(false);
  });
});

describe("productQuerySchema", () => {
  it("enforces the sort whitelist with a newest default", () => {
    expect(productQuerySchema.safeParse({ sort: "bogus" }).success).toBe(false);
    expect(productQuerySchema.parse({}).sort).toBe("newest");
  });

  it("caps pageSize at 50 and requires page >= 1", () => {
    expect(productQuerySchema.safeParse({ pageSize: "51" }).success).toBe(false);
    expect(productQuerySchema.safeParse({ pageSize: "50" }).success).toBe(true);
    expect(productQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("keeps minPrice <= maxPrice invariant", () => {
    expect(
      productQuerySchema.safeParse({ minPrice: "30", maxPrice: "20" }).success,
    ).toBe(false);
    expect(
      productQuerySchema.safeParse({ minPrice: "20", maxPrice: "20" }).success,
    ).toBe(true);
  });
});
