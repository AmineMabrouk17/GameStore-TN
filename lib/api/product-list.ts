import { NextResponse } from "next/server";
import { jsonError, jsonOk, zodErrorDetails } from "@/lib/api-response";
import { getDb } from "@/lib/db";
import * as productsRepo from "@/lib/repositories/products";
import { productQuerySchema } from "@/lib/validation";

function searchParamsToRecord(searchParams: URLSearchParams): Record<string, string> {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value !== "") raw[key] = value;
  });
  return raw;
}

export async function handleListProducts(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const parsed = productQuerySchema.safeParse(searchParamsToRecord(url.searchParams));
    if (!parsed.success) {
      return jsonError("Invalid query parameters", 400, zodErrorDetails(parsed.error));
    }
    const db = await getDb();
    const { items, total } = await productsRepo.list(parsed.data, db);
    return jsonOk({ items, total });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
