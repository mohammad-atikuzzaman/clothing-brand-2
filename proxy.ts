import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isIpBanned } from "@/lib/rate-limit";
import { isMaliciousBot } from "@/lib/security";

export function proxy(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const userAgent = request.headers.get("user-agent") || "";

  // 1. Block known automated attack scanners (sqlmap, nikto, etc.)
  if (isMaliciousBot(userAgent)) {
    console.warn(`🛡️ [WAF] Blocked malicious scanner bot UA: ${userAgent} from IP: ${ip}`);
    return new NextResponse(
      JSON.stringify({ error: "Access Denied: Malicious scanner detected." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Fast rejection for banned IPs (Zero DB or Application CPU spent)
  const banStatus = isIpBanned(ip);
  if (banStatus.banned) {
    return new NextResponse(
      JSON.stringify({
        error: "Access Temporarily Suspended",
        message: `Your IP has been restricted for ${banStatus.remainingMinutes} more minute(s) due to abnormal traffic patterns.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String((banStatus.remainingMinutes || 1) * 60),
        },
      }
    );
  }

  // 3. Inject HTTP Security Headers
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com;
    font-src 'self' data: https:;
    connect-src 'self' https:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
