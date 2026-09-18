"use server";

import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { ContactInquiry } from "@/models/ContactInquiry";
import {
  checkRateLimit,
  isIpBanned,
  penalizeMaliciousIp,
} from "@/lib/rate-limit";
import { getClientIp, verifyRequestOrigin } from "@/lib/security";
import {
  sanitizeText,
  sanitizePhone,
  hasMaliciousPattern,
} from "@/lib/sanitize";

const contactInquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (minimum 2 characters).")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+?88)?01[3-9]\d{8}$/,
      "Please enter a valid Bangladeshi phone number (e.g. 01712345678)."
    ),
  orderId: z.string().trim().max(40).optional(),
  subject: z
    .string()
    .trim()
    .min(2, "Please select or enter a subject.")
    .max(100),
  message: z
    .string()
    .trim()
    .min(5, "Message should be at least 5 characters.")
    .max(1000, "Message is too long"),
  website_field_hp: z.string().optional(), // Honeypot
  form_verify_token_hp: z.string().optional(), // Honeypot 2
});

export async function submitContactInquiryAction(
  rawData: unknown
): Promise<{ success: boolean; message: string }> {
  try {
    const clientIp = await getClientIp();

    // 1. IP Ban check (Zero DB touch for banned attackers)
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      return {
        success: false,
        message: `Your network is temporarily blocked (${banCheck.remainingMinutes}m remaining) due to repetitive spam submissions.`,
      };
    }

    // 2. CSRF / Origin check
    const originCheck = await verifyRequestOrigin();
    if (!originCheck.valid) {
      return {
        success: false,
        message: "Invalid request origin.",
      };
    }

    // 3. Honeypot check
    const payload = (rawData || {}) as Record<string, unknown>;
    const hp1 =
      typeof payload.website_field_hp === "string"
        ? payload.website_field_hp.trim()
        : "";
    const hp2 =
      typeof payload.form_verify_token_hp === "string"
        ? payload.form_verify_token_hp.trim()
        : "";

    if (hp1.length > 0 || hp2.length > 0) {
      penalizeMaliciousIp(clientIp, "Filled contact form honeypot traps");
      console.warn("🛡️ Spam bot trapped and banned from contact form:", clientIp);
      return {
        success: false,
        message: "Automated submission rejected.",
      };
    }

    // 4. Malicious pattern / XSS injection check
    const rawStringified = JSON.stringify(rawData);
    if (hasMaliciousPattern(rawStringified)) {
      penalizeMaliciousIp(clientIp, "Injected script or attack pattern in contact form");
      return {
        success: false,
        message: "Malicious input sequence detected and blocked.",
      };
    }

    // 5. Rate limit: 4 inquiries per 10 minutes per IP (3 strikes = 30m ban)
    const rateLimit = checkRateLimit(
      `contact_ip_${clientIp}`,
      4,
      10 * 60 * 1000,
      3,
      30 * 60 * 1000
    );
    if (!rateLimit.success) {
      return {
        success: false,
        message:
          rateLimit.message ||
          "Too many inquiries sent from this network. Please wait a few minutes before trying again.",
      };
    }

    // 6. Schema validation
    const validation = contactInquirySchema.safeParse(rawData);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Validation failed";
      return { success: false, message: errorMsg };
    }

    const data = validation.data;

    // 7. Input sanitization (XSS defense)
    const cleanName = sanitizeText(data.name, 80);
    const cleanPhone = sanitizePhone(data.phone);
    const cleanSubject = sanitizeText(data.subject, 100);
    const cleanMessage = sanitizeText(data.message, 1000);
    const cleanOrderId = data.orderId ? sanitizeText(data.orderId, 40) : undefined;

    if (!cleanName || !cleanPhone || !cleanSubject || !cleanMessage) {
      return {
        success: false,
        message: "Please provide valid text without restricted symbols.",
      };
    }

    // 8. Connect to MongoDB
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message:
          "Our customer service pipeline is currently undergoing quick maintenance. Please contact us via phone or WhatsApp.",
      };
    }

    await ContactInquiry.create({
      name: cleanName,
      phone: cleanPhone,
      orderId: cleanOrderId,
      subject: cleanSubject,
      message: cleanMessage,
      status: "New",
      ipAddress: clientIp,
    });

    return {
      success: true,
      message:
        "Thank you! Your inquiry has been logged. Our concierge will contact you shortly.",
    };
  } catch (error) {
    console.error("❌ submitContactInquiryAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
