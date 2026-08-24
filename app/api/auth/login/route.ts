import {
  invalidBodyResponse,
  invalidJsonBodyResponse,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api-response";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, signSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getByUsername } from "@/lib/repositories/admins";
import { loginCredentialsSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (body === null) return invalidJsonBodyResponse();

    const parsed = loginCredentialsSchema.safeParse(body);
    if (!parsed.success) return invalidBodyResponse(parsed.error);

    const db = await getDb();
    const admin = await getByUsername(db, parsed.data.username);
    if (!admin || !(await verifyPassword(parsed.data.password, admin.password_hash))) {
      return jsonError("Invalid credentials", 401);
    }

    const token = await signSession(admin.id, admin.username);
    await createSessionCookie(token);
    return jsonOk({ admin: { username: admin.username } });
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
