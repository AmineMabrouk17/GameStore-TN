import type { D1Database } from "@/lib/db";

export interface AdminRecord {
  id: string;
  username: string;
  password_hash: string;
}

export async function getByUsername(
  db: D1Database,
  username: string
): Promise<AdminRecord | null> {
  const row = await db
    .prepare("SELECT id, username, password_hash FROM admins WHERE username = ?")
    .bind(username)
    .first<AdminRecord>();
  return row ?? null;
}
