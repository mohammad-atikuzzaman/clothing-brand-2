import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "atelier_admin_session_v1";
const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error("FATAL: AUTH_SECRET environment variable is required.");
}
const SECRET_KEY = new TextEncoder().encode(authSecret);

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Creates an encrypted JWT cookie for authenticated admins
 */
export async function createAdminSession(admin: AdminSessionPayload) {
  const token = await new SignJWT({ ...admin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

/**
 * Reads and verifies the admin session from request cookies
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as string) || "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Destroys the admin session cookie on logout
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Guard for protected Server Actions
 */
export async function verifyAdminGuard(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access. Admin login required.");
  }
  return session;
}
