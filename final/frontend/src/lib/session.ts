/**
 * Server-Side Session Cookie Manager
 * ---------------------------------------------------------------------------
 * Requirement 3.1(c) & 3.1(d):
 * "The website remembers who is signed in: users never type their own ID, and
 *  they only see and change their own records."
 * "Pages of a user type open only for a signed-in user of that type."
 *
 * How it works (for beginners):
 * 1. When a user logs in via `/api/auth/login`, the server verifies their
 *    username/password using the SQL login validation function.
 * 2. The server creates a JSON object `{ userId, username, role }` and signs it
 *    with HMAC-SHA256 using `SESSION_SECRET`.
 * 3. That signed token is saved in an `httpOnly` cookie named `tayebat_session`.
 *    Because it is `httpOnly`, browser JavaScript cannot tamper with it, and every
 *    API request automatically sends it to the server so we know *exactly* who
 *    is making the request.
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/types/database";

const COOKIE_NAME = "tayebat_session";

function getSecret(): string {
  return process.env.SESSION_SECRET || "tayebat-local-dev-secret-change-me";
}

function signPayload(payloadB64: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
}

export function encodeSession(user: SessionUser): string {
  const payloadB64 = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function decodeSession(token: string | undefined): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const expectedSig = signPayload(payloadB64);
  // Constant-time comparison prevents timing attacks.
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (
      typeof parsed?.userId === "number" &&
      typeof parsed?.username === "string" &&
      typeof parsed?.role === "string"
    ) {
      return parsed as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  return decodeSession(raw);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Helper for API route handlers to enforce authentication and user role. */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}
