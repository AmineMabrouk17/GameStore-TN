import { jsonError, jsonOk } from "@/lib/api-response";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();
    return jsonOk({ admin: { id: session.adminId, username: session.username } });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
