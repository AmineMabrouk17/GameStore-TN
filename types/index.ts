export type ProductStatus = "AVAILABLE" | "RESERVED" | "SOLD";
export type Currency = "TND" | "EUR";
export type ProductSort = "newest" | "price_asc" | "price_desc";
export type Locale = "ar" | "fr";

export interface Category {
  id: string;
  name_ar: string;
  name_fr: string;
  slug: string;
  icon_url: string | null;
}

export interface CategoryWithCount extends Category {
  product_count: number;
}

export interface CategorySummary {
  id: string;
  name_ar: string;
  name_fr: string;
  slug: string;
}

export interface Product {
  id: string;
  title_ar: string;
  title_fr: string;
  category_id: string;
  price: number;
  currency: Currency;
  description_ar: string | null;
  description_fr: string | null;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  created_at: string;
}

export type ProductWithCategory = Product & {
  category: CategorySummary | null;
};

export interface CreateProductInput {
  title_ar: string;
  title_fr: string;
  category_id: string;
  price: number;
  currency: Currency;
  description_ar?: string | null;
  description_fr?: string | null;
  images?: string[];
  status: ProductStatus;
  featured?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CategoryInput {
  name_ar: string;
  name_fr: string;
  slug: string;
  icon_url?: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ProductQuery {
  categorySlug?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: ProductSort;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export type ProductListResult = Paginated<ProductWithCategory>;
