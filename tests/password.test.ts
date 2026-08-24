import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const SEEDED_HASH =
  "pbkdf2_sha256$100000$pKrqVQuais4kM9bI8oywKg==$TPqAHk3lRsYD2v8zUiLV82SOxjFPJrHPvU+nBnrAF5I=";

const HASH_REGEX =
  /^pbkdf2_sha256\$100000\$[A-Za-z0-9+/]{22}==\$[A-Za-z0-9+/]{43}=$/;

function base64Length(value: string): number {
  return Buffer.from(value, "base64").length;
}

describe("hashPassword", () => {
  it("produces a seed-compatible pbkdf2_sha256 hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toMatch(HASH_REGEX);
    expect(hash.split("$")[1]).toBe("100000");
  });

  it("generates unique salts across hashes of the same password", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);
    expect(a).not.toBe(b);
    expect(a.split("$")[2]).not.toBe(b.split("$")[2]);
  });
});

describe("verifyPassword", () => {
  it("accepts the correct password for a fresh hash", async () => {
    const hash = await hashPassword("hunter2!");
    await expect(verifyPassword("hunter2!", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("hunter2!");
    await expect(verifyPassword("hunter3!", hash)).resolves.toBe(false);
  });

  it.each([
    "",
    "garbage",
    "md5$100000$c2FsdA==$a2V5",
    "pbkdf2_sha256$abc$c2FsdA==$a2V5",
    "pbkdf2_sha256$100000$!!!invalid-base64!!!$a2V5",
    "pbkdf2_sha256$100000$",
    "pbkdf2_sha256$100000$c2FsdA==",
    "pbkdf2_sha256$99999999999$c2FsdA==$a2V5",
  ])("returns false on malformed stored hash %j", async (stored) => {
    await expect(verifyPassword("any", stored)).resolves.toBe(false);
  });
});

describe("seeded admin hash", () => {
  it("is structurally valid pbkdf2_sha256 with 16-byte salt and 32-byte key", () => {
    const segments = SEEDED_HASH.split("$");
    expect(segments).toHaveLength(4);
    expect(segments[0]).toBe("pbkdf2_sha256");
    expect(segments[1]).toBe("100000");
    expect(base64Length(segments[2] as string)).toBe(16);
    expect(base64Length(segments[3] as string)).toBe(32);
  });
});
