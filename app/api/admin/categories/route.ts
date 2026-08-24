import {
  invalidBodyResponse,
  invalidJsonBodyResponse,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api-response";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import * as categoriesRepo from "@/lib/repositories/categories";
import { categoryCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();

    const body = await parseJsonBody(request);
    if (body === null) return invalidJsonBodyResponse();

    const parsed = categoryCreateSchema.safeParse(body);
    if (!parsed.success) return invalidBodyResponse(parsed.error);

    const db = await getDb();
    const created = await categoriesRepo.create(parsed.data, db);
    return jsonOk(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
