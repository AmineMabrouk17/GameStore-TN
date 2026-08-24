import {
  invalidBodyResponse,
  invalidJsonBodyResponse,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api-response";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import * as productsRepo from "@/lib/repositories/products";
import { productUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();

    const body = await parseJsonBody(request);
    if (body === null) return invalidJsonBodyResponse();

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) return invalidBodyResponse(parsed.error);

    const { id } = await context.params;
    const db = await getDb();
    const updated = await productsRepo.update(id, parsed.data, db);
    if (!updated) {
      return jsonError("Product not found", 404);
    }
    return jsonOk(updated);
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const db = await getDb();
    const deleted = await productsRepo.deleteProduct(id, db);
    if (!deleted) {
      return jsonError("Product not found", 404);
    }
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
