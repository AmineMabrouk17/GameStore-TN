import { z } from "zod";
import type { Currency, ProductStatus } from "@/types";

export const PRODUCT_STATUSES = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
] as const satisfies readonly ProductStatus[];

export const CURRENCIES = ["TND", "EUR"] as const satisfies readonly Currency[];

export const PRODUCT_SORTS = ["newest", "price_asc", "price_desc"] as const;

const imageRefSchema = z
  .string()
  .min(1)
  .max(2048)
  .regex(/^(https?:\/\/\S+|\/\S+)$/);

export const productCreateSchema = z.object({
  title_ar: z.string().min(1).max(200),
  title_fr: z.string().min(1).max(200),
  description_ar: z.string().max(5000).nullish(),
  description_fr: z.string().max(5000).nullish(),
  category_id: z.string().min(1).max(64),
  price: z.number().positive(),
  currency: z.enum(CURRENCIES),
  images: z.array(imageRefSchema).max(6).default([]),
  status: z.enum(PRODUCT_STATUSES),
  featured: z.boolean().default(false),
});

export const productUpdateSchema = z.object({
  title_ar: z.string().min(1).max(200).optional(),
  title_fr: z.string().min(1).max(200).optional(),
  description_ar: z.string().max(5000).nullish(),
  description_fr: z.string().max(5000).nullish(),
  category_id: z.string().min(1).max(64).optional(),
  price: z.number().positive().optional(),
  currency: z.enum(CURRENCIES).optional(),
  images: z.array(imageRefSchema).max(6).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  featured: z.boolean().optional(),
});

export const categoryCreateSchema = z.object({
  name_ar: z.string().min(1).max(100),
  name_fr: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  icon_url: imageRefSchema.nullish(),
});

export const loginCredentialsSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
});

const booleanishSchema = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true");

export const productQuerySchema = z
  .object({
    categorySlug: z.string().min(1).max(100).optional(),
    status: z.enum(PRODUCT_STATUSES).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    q: z.string().trim().min(1).max(100).optional(),
    sort: z.enum(PRODUCT_SORTS).default("newest"),
    featured: booleanishSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    },
  );

export type ProductCreateData = z.infer<typeof productCreateSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
export type CategoryCreateData = z.infer<typeof categoryCreateSchema>;
export type LoginCredentialsData = z.infer<typeof loginCredentialsSchema>;
export type ProductQueryData = z.infer<typeof productQuerySchema>;
