export const UPLOAD_MAX_BYTES = 1_500_000;

export const UPLOAD_FIELD_NAME = "file";

export const UPLOAD_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export type UploadMimeType = (typeof UPLOAD_ALLOWED_MIME_TYPES)[number];

const MIME_EXTENSIONS: Record<UploadMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const UPLOAD_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isAllowedImageMime(value: unknown): value is UploadMimeType {
  return (
    typeof value === "string" &&
    (UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(value)
  );
}

export function extensionForMime(mime: UploadMimeType): string {
  return MIME_EXTENSIONS[mime];
}

export function imageUploadUrl(id: string): string {
  return `/api/images/${id}`;
}

export function isValidUploadId(value: string): boolean {
  return UPLOAD_ID_PATTERN.test(value);
}
