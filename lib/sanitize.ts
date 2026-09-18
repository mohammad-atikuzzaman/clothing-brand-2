/**
 * Input sanitization utility to protect against Stored & Reflected Cross-Site Scripting (XSS),
 * HTML injection, and control character attacks.
 */

/**
 * Strips HTML tags, script blocks, style tags, and dangerous protocols
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Truncate input to safe maximum length
  let text = input.trim().slice(0, maxLength);

  // 2. Strip script, iframe, object, embed, style tags and their contents
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  text = text.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  text = text.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  text = text.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // 3. Remove all remaining HTML tags
  text = text.replace(/<\/?[^>]+(>|$)/g, "");

  // 4. Remove dangerous javascript: / data: / vbscript: URI schemes
  text = text.replace(/javascript\s*:/gi, "");
  text = text.replace(/vbscript\s*:/gi, "");
  text = text.replace(/data\s*:[^,]+,/gi, "");

  // 5. Remove event handlers like onload=, onerror=, onclick=
  text = text.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  text = text.replace(/on\w+\s*=\s*[^>\s]+/gi, "");

  // 6. Remove null bytes and dangerous control characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return text.trim();
}

/**
 * Specifically validates and sanitizes a Bangladeshi mobile phone number
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  const cleaned = phone.replace(/[^0-9+]/g, "").trim();
  // Strip +88 or 88 country code prefix to get standard 11 digits
  let standard = cleaned;
  if (standard.startsWith("+880")) {
    standard = standard.slice(3);
  } else if (standard.startsWith("880")) {
    standard = standard.slice(2);
  }
  return standard;
}

/**
 * Checks if a string contains known attack patterns (SQLi, NoSQLi, path traversal, XSS)
 */
export function hasMaliciousPattern(input: string): boolean {
  if (!input) return false;
  const lower = input.toLowerCase();

  const patterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /select\s+.*\s+from/i,
    /union\s+select/i,
    /\$where/i,
    /\$gt/i,
    /\$ne/i,
    /\.\.\//, // Directory traversal
    /\.\.\\/,
  ];

  return patterns.some((p) => p.test(lower));
}
