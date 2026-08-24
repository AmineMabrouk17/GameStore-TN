import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";

process.env.ADMIN_JWT_SECRET = "test-secret-that-is-long-enough-32-chars!!!";

const { SESSION_COOKIE, signSession, verifySessionToken } = await import(
  "@/lib/auth/session"
);

const TEST_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

async function signExpiredToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ adminId: "admin-root", username: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now - 7200)
    .setExpirationTime(now - 3600)
    .sign(TEST_SECRET);
}

function tamperToken(token: string): string {
  const segments = token.split(".");
  const payload = segments[1] as string;
  const flipped = (payload[0] === "A" ? "B" : "A") + payload.slice(1);
  segments[1] = flipped;
  return segments.join(".");
}

describe("session", () => {
  it("uses the canonical session cookie name", () => {
    expect(SESSION_COOKIE).toBe("gs_admin_session");
  });

  it("round-trips sign -> verify with the correct payload", async () => {
    const token = await signSession("admin-root", "admin");
    await expect(verifySessionToken(token)).resolves.toEqual({
      adminId: "admin-root",
      username: "admin",
    });
  });

  it("rejects an expired token", async () => {
    const token = await signExpiredToken();
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signSession("admin-root", "admin");
    await expect(verifySessionToken(tamperToken(token))).resolves.toBeNull();
  });

  it.each(["", "not-a-jwt", "a.b.c", "eyJhbGciOiJIUzI1NiJ9.eyJ4IjoxfQ.bad"])(
    "returns null (not throw) on garbage input %j",
    async (token) => {
      await expect(verifySessionToken(token)).resolves.toBeNull();
    }
  );
});
