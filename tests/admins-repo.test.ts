import { describe, expect, it, vi } from "vitest";
import type { D1Database, D1PreparedStatement } from "@/lib/db";

const { getByUsername } = await import("@/lib/repositories/admins");

interface CapturedQuery {
  sql: string;
  bindings: unknown[];
  row: Record<string, unknown> | null;
}

function makeDb(row: Record<string, unknown> | null): {
  db: D1Database;
  captured: CapturedQuery;
} {
  const captured: CapturedQuery = { sql: "", bindings: [], row };
  const statement: D1PreparedStatement = {
    bind(...values: unknown[]) {
      captured.bindings = values;
      return statement;
    },
    first<T = Record<string, unknown>>() {
      return Promise.resolve((captured.row as T | null) ?? null);
    },
    all() {
      return Promise.resolve({ results: [], success: true, meta: {} });
    },
    run() {
      return Promise.resolve({ results: [], success: true, meta: {} });
    },
  };
  const db = {
    prepare(sql: string) {
      captured.sql = sql;
      return statement;
    },
    batch: vi.fn(),
  } as unknown as D1Database;
  return { db, captured };
}

describe("admins.getByUsername", () => {
  it("selects only id, username and password_hash bound by username", async () => {
    const adminRow = {
      id: "admin-root",
      username: "admin",
      password_hash: "pbkdf2_sha256$100000$salt$key",
    };
    const { db, captured } = makeDb(adminRow);

    const admin = await getByUsername(db, "admin");

    expect(captured.sql).toBe(
      "SELECT id, username, password_hash FROM admins WHERE username = ?"
    );
    expect(captured.bindings).toEqual(["admin"]);
    expect(admin).toEqual(adminRow);
  });

  it("returns null when no admin matches", async () => {
    const { db, captured } = makeDb(null);
    const admin = await getByUsername(db, "ghost");
    expect(captured.bindings).toEqual(["ghost"]);
    expect(admin).toBeNull();
  });
});
