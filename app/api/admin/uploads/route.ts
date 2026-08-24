import { jsonError, jsonOk } from "@/lib/api-response";
import {
  UPLOAD_FIELD_NAME,
  UPLOAD_MAX_BYTES,
  extensionForMime,
  imageUploadUrl,
  isAllowedImageMime,
} from "@/lib/api/uploads";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import * as uploadsRepo from "@/lib/repositories/uploads";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonError("Request body must be multipart form data", 400);
    }

    const file = formData.get(UPLOAD_FIELD_NAME);
    if (!(file instanceof File)) {
      return jsonError(`Missing "${UPLOAD_FIELD_NAME}" file field`, 400);
    }
    if (!isAllowedImageMime(file.type)) {
      return jsonError(
        "Unsupported image type. Allowed: PNG, JPEG, WebP, GIF",
        415,
      );
    }
    if (file.size === 0) {
      return jsonError("File is empty", 400);
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      return jsonError(
        `Image is too large. Maximum size is ${Math.round(UPLOAD_MAX_BYTES / 1000)} KB`,
        413,
      );
    }

    const id = crypto.randomUUID();
    const data = new Uint8Array(await file.arrayBuffer());
    const db = await getDb();
    await uploadsRepo.create({ id, mimeType: file.type, data }, db);
    return jsonOk(
      { id, url: imageUploadUrl(id), type: extensionForMime(file.type) },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return jsonError("Internal server error", 500);
  }
}
