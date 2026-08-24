import { jsonError, jsonOk } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
