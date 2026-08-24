import { jsonError, jsonOk } from "@/lib/api-response";
import { getDb } from "@/lib/db";
import * as categoriesRepo from "@/lib/repositories/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const categories = await categoriesRepo.list(db);
    return jsonOk({ categories });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
