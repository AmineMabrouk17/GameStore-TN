export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatement[]
  ): Promise<D1Result<T>[]>;
}

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

let cachedDb: D1Database | null = null;

export async function getDb(): Promise<D1Database> {
  if (!cachedDb) {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({
      async: true,
    });
    cachedDb = env.DB;
  }
  return cachedDb;
}
