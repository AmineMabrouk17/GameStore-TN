import type { D1Database } from "@/lib/db";
import { buildProductFilters } from "@/lib/product-filters";
import type {
  CreateProductInput,
  Currency,
  ProductListResult,
  ProductQuery,
  ProductStatus,
  ProductWithCategory,
  UpdateProductInput,
} from "@/types";

const PRODUCT_STATUSES: readonly ProductStatus[] = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
];

const BASE_SELECT =
  "SELECT p.id, p.title_ar, p.title_fr, p.category_id, p.price, p.currency, p.description_ar, p.description_fr, p.images, p.status, p.featured, p.created_at, c.id AS category_join_id, c.slug AS category_slug, c.name_ar AS category_name_ar, c.name_fr AS category_name_fr FROM products p LEFT JOIN categories c ON c.id = p.category_id";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export interface ProductRecord {
  id: string;
  title_ar: string;
  title_fr: string;
  category_id: string;
  price: number;
  currency: string;
  description_ar: string | null;
  description_fr: string | null;
  images: string;
  status: string;
  featured: number | null;
  created_at: string;
  category_join_id: string | null;
  category_slug: string | null;
  category_name_ar: string | null;
  category_name_fr: string | null;
}

export function parseImages(value: unknown): string[] {
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function mapProductRow(row: ProductRecord): ProductWithCategory {
  const status = PRODUCT_STATUSES.find((candidate) => candidate === row.status);
  if (!status) {
    throw new Error(`Unexpected product status in database: ${String(row.status)}`);
  }
  const currency: Currency = row.currency === "EUR" ? "EUR" : "TND";
  const category =
    row.category_join_id !== null &&
    row.category_slug !== null &&
    row.category_name_ar !== null &&
    row.category_name_fr !== null
      ? {
          id: row.category_join_id,
          name_ar: row.category_name_ar,
          name_fr: row.category_name_fr,
          slug: row.category_slug,
        }
      : null;
  return {
    id: row.id,
    title_ar: row.title_ar,
    title_fr: row.title_fr,
    category_id: row.category_id,
    price: row.price,
    currency,
    description_ar: row.description_ar,
    description_fr: row.description_fr,
    images: parseImages(row.images),
    status,
    featured: row.featured === 1,
    created_at: row.created_at,
    category,
  };
}

function resolvePagination(query: ProductQuery): { limit: number; offset: number } {
  const page =
    query.page !== undefined && Number.isFinite(query.page)
      ? Math.max(Math.floor(query.page), DEFAULT_PAGE)
      : DEFAULT_PAGE;
  const pageSize =
    query.pageSize !== undefined && Number.isFinite(query.pageSize)
      ? Math.min(Math.max(Math.floor(query.pageSize), 1), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

export async function list(
  filters: ProductQuery,
  db: D1Database,
): Promise<ProductListResult> {
  const { whereSql, orderBySql, params } = buildProductFilters(filters);
  const { limit, offset } = resolvePagination(filters);
  const whereFragment = whereSql.length > 0 ? ` WHERE ${whereSql}` : "";

  const totalRow = await db
    .prepare(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id${whereFragment}`,
    )
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`${BASE_SELECT}${whereFragment} ORDER BY ${orderBySql} LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all<ProductRecord>();

  return { items: results.map(mapProductRow), total: totalRow?.total ?? 0 };
}

export async function getById(
  id: string,
  db: D1Database,
): Promise<ProductWithCategory | null> {
  const row = await db
    .prepare(`${BASE_SELECT} WHERE p.id = ?`)
    .bind(id)
    .first<ProductRecord>();
  return row ? mapProductRow(row) : null;
}

export async function create(
  input: CreateProductInput,
  db: D1Database,
  id?: string,
): Promise<ProductWithCategory> {
  const newId = id ?? crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO products (id, title_ar, title_fr, category_id, price, currency, description_ar, description_fr, images, status, featured, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(
      newId,
      input.title_ar,
      input.title_fr,
      input.category_id,
      input.price,
      input.currency,
      input.description_ar ?? null,
      input.description_fr ?? null,
      JSON.stringify(input.images ?? []),
      input.status,
      input.featured ? 1 : 0,
    )
    .run();
  const created = await getById(newId, db);
  if (!created) {
    throw new Error("Failed to load created product");
  }
  return created;
}

export async function update(
  id: string,
  patch: UpdateProductInput,
  db: D1Database,
): Promise<ProductWithCategory | null> {
  const assignments: string[] = [];
  const params: unknown[] = [];

  if (patch.title_ar !== undefined) {
    assignments.push("title_ar = ?");
    params.push(patch.title_ar);
  }
  if (patch.title_fr !== undefined) {
    assignments.push("title_fr = ?");
    params.push(patch.title_fr);
  }
  if (patch.description_ar !== undefined) {
    assignments.push("description_ar = ?");
    params.push(patch.description_ar ?? null);
  }
  if (patch.description_fr !== undefined) {
    assignments.push("description_fr = ?");
    params.push(patch.description_fr ?? null);
  }
  if (patch.category_id !== undefined) {
    assignments.push("category_id = ?");
    params.push(patch.category_id);
  }
  if (patch.price !== undefined) {
    assignments.push("price = ?");
    params.push(patch.price);
  }
  if (patch.currency !== undefined) {
    assignments.push("currency = ?");
    params.push(patch.currency);
  }
  if (patch.images !== undefined) {
    assignments.push("images = ?");
    params.push(JSON.stringify(patch.images));
  }
  if (patch.status !== undefined) {
    assignments.push("status = ?");
    params.push(patch.status);
  }
  if (patch.featured !== undefined) {
    assignments.push("featured = ?");
    params.push(patch.featured ? 1 : 0);
  }

  if (assignments.length === 0) {
    return getById(id, db);
  }

  params.push(id);
  await db
    .prepare(`UPDATE products SET ${assignments.join(", ")} WHERE id = ?`)
    .bind(...params)
    .run();
  return getById(id, db);
}

export async function deleteProduct(id: string, db: D1Database): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM products WHERE id = ?")
    .bind(id)
    .run();
  return result.success && Number(result.meta["changes"] ?? 0) > 0;
}

export async function setStatus(
  id: string,
  status: ProductStatus,
  db: D1Database,
): Promise<boolean> {
  const result = await db
    .prepare("UPDATE products SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
  return result.success && Number(result.meta["changes"] ?? 0) > 0;
}

export async function setFeatured(
  id: string,
  featured: boolean,
  db: D1Database,
): Promise<boolean> {
  const result = await db
    .prepare("UPDATE products SET featured = ? WHERE id = ?")
    .bind(featured ? 1 : 0, id)
    .run();
  return result.success && Number(result.meta["changes"] ?? 0) > 0;
}

export async function getFeatured(db: D1Database): Promise<ProductWithCategory[]> {
  const { results } = await db
    .prepare(`${BASE_SELECT} WHERE p.featured = 1 ORDER BY p.created_at DESC`)
    .all<ProductRecord>();
  return results.map(mapProductRow);
}
