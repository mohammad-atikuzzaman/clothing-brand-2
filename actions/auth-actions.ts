"use server";

import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import {
  createAdminSession,
  clearAdminSession,
  getAdminSession,
} from "@/lib/auth";
import {
  checkRateLimit,
  isIpBanned,
  penalizeMaliciousIp,
} from "@/lib/rate-limit";
import { getClientIp, verifyRequestOrigin } from "@/lib/security";
import { sanitizeText, hasMaliciousPattern } from "@/lib/sanitize";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

/**
 * Ensures at least one admin account exists in MongoDB Atlas
 */
export async function seedAdminIfEmptyAction() {
  try {
    if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
      console.warn("⚠️ DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not configured. Skipping admin auto-seed.");
      return { success: false, message: "Admin credentials not configured in environment." };
    }

    const db = await connectToDatabase();
    if (!db) return { success: false, message: "Database not connected" };

    const count = await Admin.countDocuments();
    if (count === 0) {
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await Admin.create({
        name: "Studio Executive",
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: "superadmin",
      });
      return {
        success: true,
        message: `Created primary admin account: ${DEFAULT_ADMIN_EMAIL}`,
      };
    }
    return { success: true, message: `Admin accounts exist (${count}).` };
  } catch (err) {
    console.error("seedAdminIfEmpty error:", err);
    return { success: false, message: "Failed to seed admin" };
  }
}

/**
 * Authenticates admin and establishes secure session cookie with Brute-Force lockout
 */
export async function loginAdminAction(formData: {
  email: string;
  password: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const clientIp = await getClientIp();

    // 1. IP Ban check (Zero DB touch for banned IPs)
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      return {
        success: false,
        message: `Admin access from this network is locked for ${banCheck.remainingMinutes}m due to repeated invalid attempts.`,
      };
    }

    // 2. CSRF / Origin verification
    const originCheck = await verifyRequestOrigin();
    if (!originCheck.valid) {
      return {
        success: false,
        message: "Invalid request origin.",
      };
    }

    // 3. Brute force rate limiting (5 attempts per 10 mins; 3 strikes = 30m ban)
    const rateLimit = checkRateLimit(
      `admin_login_${clientIp}`,
      5,
      10 * 60 * 1000,
      3,
      30 * 60 * 1000
    );
    if (!rateLimit.success) {
      return {
        success: false,
        message:
          rateLimit.message ||
          "Too many failed login attempts. This IP address has been temporarily locked out.",
      };
    }

    const email = sanitizeText(formData.email?.trim().toLowerCase(), 100);
    const password = formData.password;

    if (hasMaliciousPattern(email)) {
      penalizeMaliciousIp(clientIp, "Injected attack pattern in admin login");
      return { success: false, message: "Security violation detected." };
    }

    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    const db = await connectToDatabase();

    if (!db) {
      return {
        success: false,
        message: "Authentication service temporarily unavailable. Database connection required.",
      };
    }

    // Auto-seed if empty
    await seedAdminIfEmptyAction();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return { success: false, message: "Invalid email or password." };
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, message: "Invalid email or password." };
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    await createAdminSession({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Login error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected authentication error occurred.",
    };
  }
}

/**
 * Destroys session
 */
export async function logoutAdminAction() {
  await clearAdminSession();
  return { success: true };
}

/**
 * Reads active session
 */
export async function getCurrentAdminAction() {
  return await getAdminSession();
}
