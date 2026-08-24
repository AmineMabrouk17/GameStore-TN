import type { ProductQuery } from "@/types";

export interface BuiltFilters {
  whereSql: string;
  orderBySql: string;
  params: unknown[];
}

const ORDER_BY_CLAUSES: Record<string, string> = {
  newest: "p.created_at DESC",
  price_asc: "p.price ASC",
  price_desc: "p.price DESC",
};

function escapeLikeTerm(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function buildProductFilters(query: ProductQuery): BuiltFilters {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.categorySlug !== undefined) {
    conditions.push("c.slug = ?");
    params.push(query.categorySlug);
  }
  if (query.status !== undefined) {
    conditions.push("p.status = ?");
    params.push(query.status);
  }
  if (query.minPrice !== undefined) {
    conditions.push("p.price >= ?");
    params.push(query.minPrice);
  }
  if (query.maxPrice !== undefined) {
    conditions.push("p.price <= ?");
    params.push(query.maxPrice);
  }
  if (query.featured !== undefined) {
    conditions.push("p.featured = ?");
    params.push(query.featured ? 1 : 0);
  }
  if (query.q !== undefined && query.q.length > 0) {
    conditions.push(
      "(p.title_ar LIKE ? ESCAPE '\\' OR p.title_fr LIKE ? ESCAPE '\\' OR p.description_ar LIKE ? ESCAPE '\\' OR p.description_fr LIKE ? ESCAPE '\\')",
    );
    const term = `%${escapeLikeTerm(query.q)}%`;
    params.push(term, term, term, term);
  }

  const orderBySql = ORDER_BY_CLAUSES[query.sort ?? "newest"] ?? "p.created_at DESC";

  return {
    whereSql: conditions.join(" AND "),
    orderBySql,
    params,
  };
}
