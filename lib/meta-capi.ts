// Server-Side Meta Conversions API (CAPI) Helper
// Bypasses iOS 14.5+ ATT restrictions, Safari ITP, and AdBlockers
// Ensures 100% of e-commerce Purchase events are accurately credited to your Meta Ads.

import crypto from "crypto";

export interface MetaCapiPurchasePayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryZone: string;
  total: number;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  eventId: string;
  clientIp?: string;
  userAgent?: string;
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
}

/**
 * Normalizes and hashes strings with SHA-256 according to Meta CAPI specification
 */
function hashSha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/**
 * Formats Bangladeshi phone number to international E.164 standard before hashing
 * Example: "01712345678" -> "8801712345678"
 */
function normalizeAndHashPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "88" + cleaned;
  } else if (!cleaned.startsWith("88") && cleaned.length === 10) {
    cleaned = "880" + cleaned;
  }
  return hashSha256(cleaned);
}

/**
 * Sends a server-side Purchase event directly to Meta Graph API
 * Completely resilient: non-blocking with automatic error handling.
 */
export async function sendMetaCapiPurchaseEvent(
  params: MetaCapiPurchasePayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const pixelId =
      params.pixelId ||
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID;

    const accessToken =
      params.accessToken ||
      process.env.META_CAPI_ACCESS_TOKEN ||
      process.env.FB_ACCESS_TOKEN;

    const testEventCode =
      params.testEventCode ||
      process.env.META_TEST_EVENT_CODE;

    if (!pixelId || !accessToken) {
      // CAPI not configured yet - gracefully exit without error
      return {
        success: false,
        message: "Meta Pixel ID or CAPI Access Token not configured.",
      };
    }

    // Name splitting for Meta user_data
    const nameParts = params.customerName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const userData: Record<string, unknown> = {
      ph: [normalizeAndHashPhone(params.customerPhone)],
      fn: [hashSha256(firstName)],
      ln: [hashSha256(lastName)],
      country: [hashSha256("bd")],
    };

    if (params.customerEmail && params.customerEmail.includes("@")) {
      userData.em = [hashSha256(params.customerEmail)];
    }

    if (params.clientIp && params.clientIp !== "127.0.0.1" && params.clientIp !== "::1") {
      userData.client_ip_address = params.clientIp;
    }

    if (params.userAgent) {
      userData.client_user_agent = params.userAgent;
    }

    const contents = params.items.map((it) => ({
      id: String(it.productId),
      quantity: it.quantity,
      item_price: it.price,
    }));

    const eventPayload: Record<string, unknown> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: params.eventId, // Matches browser eventID for deduplication
          event_source_url: "https://noiratelier.com",
          action_source: "website",
          user_data: userData,
          custom_data: {
            currency: "BDT",
            value: params.total,
            order_id: params.orderNumber,
            content_type: "product",
            contents: contents,
            num_items: params.items.reduce((acc, i) => acc + i.quantity, 0),
          },
        },
      ],
    };

    if (testEventCode && testEventCode.trim() !== "") {
      eventPayload.test_event_code = testEventCode.trim();
    }

    const url = `https://graph.facebook.com/v19.0/${pixelId.trim()}/events?access_token=${accessToken.trim()}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    const resJson = await response.json();

    if (!response.ok) {
      console.warn("⚠️ Meta CAPI request returned non-200 status:", resJson);
      return {
        success: false,
        message: resJson?.error?.message || "Meta CAPI request failed",
      };
    }

    return {
      success: true,
      message: `Meta CAPI event sent successfully (events_received: ${resJson.events_received})`,
    };
  } catch (error) {
    console.error("❌ Meta CAPI transmission error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error in CAPI transmission",
    };
  }
}
