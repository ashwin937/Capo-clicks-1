import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const COOKIE_NAME = "capo_admin_session";

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Builds a signed, expiring session token: "<expiryTimestamp>.<signature>".
// The signature proves the token was issued by this server (using the admin
// password as the signing secret) without ever putting the password itself
// in the cookie — so a leaked cookie doesn't hand over the actual password.
export function createAdminSessionToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const expiry = Date.now() + SESSION_DURATION_MS;
  const payload = String(expiry);
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload, secret);
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return false;

  const expiry = Number(payload);
  if (!expiry || Date.now() > expiry) return false;

  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return verifyAdminSessionToken(session?.value);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
