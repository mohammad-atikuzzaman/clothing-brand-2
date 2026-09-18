// Type-safe Meta (Facebook) Pixel Event Helper
// Designed to capture all standard e-commerce events with zero runtime errors

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export interface MetaContentItem {
  id: string;
  quantity: number;
  item_price: number;
}

/**
 * Standard PageView event
 */
export function pageview() {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", "PageView");
    } catch (err) {
      console.warn("Meta Pixel PageView error:", err);
    }
  }
}

/**
 * ViewContent: Triggered when user opens/inspects a product
 */
export function trackViewContent(options: {
  id: string;
  title: string;
  category?: string;
  price: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", "ViewContent", {
        content_ids: [String(options.id)],
        content_name: options.title,
        content_type: "product",
        content_category: options.category || "Apparel",
        value: Number(options.price),
        currency: options.currency || "BDT",
      });
    } catch (err) {
      console.warn("Meta Pixel ViewContent error:", err);
    }
  }
}

/**
 * AddToCart: Triggered when user adds an item to their shopping bag
 */
export function trackAddToCart(options: {
  id: string;
  title: string;
  category?: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      const qty = options.quantity || 1;
      window.fbq("track", "AddToCart", {
        content_ids: [String(options.id)],
        content_name: options.title,
        content_type: "product",
        content_category: options.category || "Apparel",
        value: Number(options.price) * qty,
        currency: options.currency || "BDT",
        contents: [
          {
            id: String(options.id),
            quantity: qty,
            item_price: Number(options.price),
          },
        ],
      });
    } catch (err) {
      console.warn("Meta Pixel AddToCart error:", err);
    }
  }
}

/**
 * InitiateCheckout: Triggered when user opens checkout modal or begins COD process
 */
export function trackInitiateCheckout(options: {
  items: Array<{
    productId: string;
    title?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", "InitiateCheckout", {
        content_ids: options.items.map((i) => String(i.productId)),
        contents: options.items.map((i) => ({
          id: String(i.productId),
          quantity: i.quantity,
          item_price: i.price,
        })),
        content_type: "product",
        num_items: options.items.reduce((acc, i) => acc + i.quantity, 0),
        value: Number(options.total),
        currency: options.currency || "BDT",
      });
    } catch (err) {
      console.warn("Meta Pixel InitiateCheckout error:", err);
    }
  }
}

/**
 * Purchase: Triggered upon successful order placement
 * Includes eventID for 100% deduplication with Server Conversions API (CAPI)
 */
export function trackPurchase(options: {
  orderNumber: string;
  total: number;
  items?: Array<{
    productId: string;
    title?: string;
    price: number;
    quantity: number;
  }>;
  eventId?: string;
  currency?: string;
}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      const items = options.items || [];
      const eventData: Record<string, unknown> = {
        content_ids: items.map((i) => String(i.productId)),
        contents: items.map((i) => ({
          id: String(i.productId),
          quantity: i.quantity,
          item_price: i.price,
        })),
        content_type: "product",
        num_items: items.reduce((acc, i) => acc + i.quantity, 0),
        value: Number(options.total),
        currency: options.currency || "BDT",
        order_id: options.orderNumber,
      };

      // Deduplication parameter: must match the Server CAPI event_id
      const eventOptions = options.eventId ? { eventID: options.eventId } : undefined;

      window.fbq("track", "Purchase", eventData, eventOptions);
    } catch (err) {
      console.warn("Meta Pixel Purchase error:", err);
    }
  }
}

/**
 * Contact: Triggered when user clicks WhatsApp concierge or phone call
 */
export function trackContact(channel: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", "Contact", {
        content_name: channel,
      });
    } catch (err) {
      console.warn("Meta Pixel Contact error:", err);
    }
  }
}
