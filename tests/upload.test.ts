import { describe, expect, it } from "vitest";
import {
  UPLOAD_ALLOWED_MIME_TYPES,
  UPLOAD_MAX_BYTES,
  extensionForMime,
  imageUploadUrl,
  isAllowedImageMime,
  isValidUploadId,
} from "@/lib/api/uploads";

describe("upload helpers", () => {
  it("accepts the allowed image mime types", () => {
    for (const mime of UPLOAD_ALLOWED_MIME_TYPES) {
      expect(isAllowedImageMime(mime)).toBe(true);
    }
  });

  it("rejects non-image or unknown mime types", () => {
    expect(isAllowedImageMime("application/pdf")).toBe(false);
    expect(isAllowedImageMime("image/svg+xml")).toBe(false);
    expect(isAllowedImageMime("")).toBe(false);
    expect(isAllowedImageMime(null)).toBe(false);
    expect(isAllowedImageMime(undefined)).toBe(false);
    expect(isAllowedImageMime(42)).toBe(false);
  });

  it("maps mime types to file extensions", () => {
    expect(extensionForMime("image/png")).toBe("png");
    expect(extensionForMime("image/jpeg")).toBe("jpg");
    expect(extensionForMime("image/webp")).toBe("webp");
    expect(extensionForMime("image/gif")).toBe("gif");
  });

  it("builds a public url under /api/images", () => {
    const url = imageUploadUrl("abc-123");
    expect(url).toBe("/api/images/abc-123");
    // must satisfy the product imageRefSchema (root-relative path)
    expect(url).toMatch(/^(https?:\/\/\S+|\/\S+)$/);
  });

  it("validates uuid-shaped upload ids only", () => {
    expect(isValidUploadId("c2f1a9e0-1b2c-4d3e-8f9a-0b1c2d3e4f5a")).toBe(true);
    expect(isValidUploadId("C2F1A9E0-1B2C-4D3E-8F9A-0B1C2D3E4F5A")).toBe(true);
    expect(isValidUploadId("../../etc/passwd")).toBe(false);
    expect(isValidUploadId("abc-123")).toBe(false);
    expect(isValidUploadId("")).toBe(false);
  });

  it("caps uploads below the D1 blob limit", () => {
    expect(UPLOAD_MAX_BYTES).toBeLessThanOrEqual(2_000_000);
    expect(UPLOAD_MAX_BYTES).toBeGreaterThan(0);
  });
});
