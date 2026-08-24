import { isValidUploadId } from "@/lib/api/uploads";
import { getDb } from "@/lib/db";
import * as uploadsRepo from "@/lib/repositories/uploads";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!isValidUploadId(id)) {
      return new Response("Not found", { status: 404 });
    }

    const db = await getDb();
    const upload = await uploadsRepo.getById(id, db);
    if (!upload) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(upload.data as unknown as BodyInit, {
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Length": String(upload.data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
