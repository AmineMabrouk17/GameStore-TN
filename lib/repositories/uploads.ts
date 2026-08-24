import type { D1Database } from "@/lib/db";

export interface CreateUploadInput {
  id: string;
  mimeType: string;
  data: Uint8Array;
}

export interface UploadedImage {
  id: string;
  mimeType: string;
  data: Uint8Array;
}

interface UploadRow {
  id: string;
  mime_type: string;
  data: unknown;
}

function toBytes(value: unknown): Uint8Array | null {
  // D1 may hand back views/buffers from another realm (miniflare/workerd),
  // so avoid instanceof and check the internal slots instead.
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (
    value !== null &&
    typeof value === "object" &&
    ArrayBuffer.isView(value)
  ) {
    const view = value as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  // The dev binding proxy serializes BLOBs as plain arrays of byte numbers.
  if (Array.isArray(value)) {
    return Uint8Array.from(value, (byte) => Number(byte) & 0xff);
  }
  return null;
}

export async function create(
  input: CreateUploadInput,
  db: D1Database,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO uploads (id, mime_type, size, data, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
    )
    .bind(input.id, input.mimeType, input.data.byteLength, input.data)
    .run();
}

export async function getById(
  id: string,
  db: D1Database,
): Promise<UploadedImage | null> {
  const row = await db
    .prepare("SELECT id, mime_type, data FROM uploads WHERE id = ?")
    .bind(id)
    .first<UploadRow>();
  if (!row || typeof row.mime_type !== "string") return null;
  const data = toBytes(row.data);
  if (!data) return null;
  return { id: row.id, mimeType: row.mime_type, data };
}
