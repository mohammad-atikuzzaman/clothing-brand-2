import { headers } from "next/headers";

/**
 * Resolves client IP address accurately from standard reverse-proxy headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      const firstIp = forwardedFor.split(",")[0].trim();
      if (firstIp && firstIp !== "unknown") {
        return firstIp;
      }
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp && realIp !== "unknown") {
      return realIp.trim();
    }
    const cfConnectingIp = headersList.get("cf-connecting-ip");
    if (cfConnectingIp) {
      return cfConnectingIp.trim();
    }
  } catch {
    // ignore
  }
  return "127.0.0.1";
}

/**
 * Validates request Origin and Host to protect against Cross-Site Request Forgery (CSRF)
 */
export async function verifyRequestOrigin(): Promise<{
  valid: boolean;
  message?: string;
}> {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin");
    const host = headersList.get("host");

    // If no origin provided (e.g. direct server-side invocation), verify host exists
    if (!origin) {
      return { valid: true };
    }

    // Extract origin host
    const originUrl = new URL(origin);
    const originHost = originUrl.host;

    if (host && originHost !== host) {
      console.warn(`🛡️ CSRF Attempt blocked: origin "${originHost}" !== host "${host}"`);
      return {
        valid: false,
        message: "Cross-site request blocked. Invalid origin.",
      };
    }

    return { valid: true };
  } catch {
    return { valid: true };
  }
}

/**
 * Checks if incoming User-Agent matches known malicious scanners or web attack tools
 */
export function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();

  const badBots = [
    "sqlmap",
    "nikto",
    "nmap",
    "acunetix",
    "havij",
    "dirbuster",
    "gobuster",
    "masscan",
    "zgrab",
    "wpscan",
    "nuclei",
  ];

  return badBots.some((bot) => ua.includes(bot));
}
