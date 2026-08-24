import type { D1Database } from "@/lib/db";
import type { Category, CategoryInput, CategoryWithCount } from "@/types";

interface CategoryRecord {
  id: string;
  name_ar: string;
  name_fr: string;
  slug: string;
  icon_url: string | null;
}

function mapCategoryRow(row: CategoryRecord): Category {
  return {
    id: row.id,
    name_ar: row.name_ar,
    name_fr: row.name_fr,
    slug: row.slug,
    icon_url: row.icon_url,
  };
}

export async function list(db: D1Database): Promise<CategoryWithCount[]> {
  const { results } = await db
    .prepare(
      `SELECT c.id, c.name_ar, c.name_fr, c.slug, c.icon_url, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name_fr ASC`,
    )
    .all<CategoryRecord & { product_count: number }>();
  return results.map((row) => ({
    ...mapCategoryRow(row),
    product_count: row.product_count,
  }));
}

export async function getBySlug(
  slug: string,
  db: D1Database,
): Promise<Category | null> {
  const row = await db
    .prepare("SELECT id, name_ar, name_fr, slug, icon_url FROM categories WHERE slug = ?")
    .bind(slug)
    .first<CategoryRecord>();
  return row ? mapCategoryRow(row) : null;
}

export async function create(
  input: CategoryInput,
  db: D1Database,
  id?: string,
): Promise<Category> {
  const newId = id ?? crypto.randomUUID();
  await db
    .prepare("INSERT INTO categories (id, name_ar, name_fr, slug, icon_url) VALUES (?, ?, ?, ?, ?)")
    .bind(newId, input.name_ar, input.name_fr, input.slug, input.icon_url ?? null)
    .run();
  return {
    id: newId,
    name_ar: input.name_ar,
    name_fr: input.name_fr,
    slug: input.slug,
    icon_url: input.icon_url ?? null,
  };
}
