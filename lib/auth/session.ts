import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gs_admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 32;

export interface AdminSession {
  adminId: string;
  username: string;
}

let warnedShortSecret = false;

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_JWT_SECRET is not set. Dev: add it to .env.local / .dev.vars. Prod: npx wrangler secret put ADMIN_JWT_SECRET"
    );
  }
  if (secret.length < MIN_SECRET_LENGTH && !warnedShortSecret) {
    warnedShortSecret = true;
    console.warn(
      "ADMIN_JWT_SECRET is shorter than 32 chars; use a longer random secret."
    );
  }
  return new TextEncoder().encode(secret);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function signSession(
  adminId: string,
  username: string
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  return await new SignJWT({ adminId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + SESSION_MAX_AGE_SECONDS)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const { adminId, username } = payload as {
      adminId?: unknown;
      username?: unknown;
    };
    if (typeof adminId !== "string" || typeof username !== "string") {
      return null;
    }
    return { adminId, username };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<AdminSession | null> {
  return getAdminSession();
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function createSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE_SECONDS));
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cookieOptions(0));
}

export async function requireAdminPage(locale: string): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }
  return session;
}
