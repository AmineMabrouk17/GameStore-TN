import { jsonError, jsonOk } from "@/lib/api-response";
import { getDb } from "@/lib/db";
import * as productsRepo from "@/lib/repositories/products";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await getDb();
    const product = await productsRepo.getById(id, db);
    if (!product) {
      return jsonError("Product not found", 404);
    }
    return jsonOk(product);
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
