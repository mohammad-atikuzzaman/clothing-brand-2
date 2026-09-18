"use server";

import { connectToDatabase } from "@/lib/db";
import { Order, OrderStatus } from "@/models/Order";
import {
  checkRateLimit,
  isIpBanned,
  banIp,
  penalizeMaliciousIp,
} from "@/lib/rate-limit";
import { getClientIp, verifyRequestOrigin } from "@/lib/security";
import {
  sanitizePhone,
  sanitizeText,
  hasMaliciousPattern,
} from "@/lib/sanitize";

export interface TrackOrderResult {
  success: boolean;
  message?: string;
  order?: {
    orderNumber: string;
    customerName: string;
    deliveryZone: string;
    itemCount: number;
    subtotal: number;
    deliveryCharge: number;
    total: number;
    status: OrderStatus;
    createdAt: string;
    timeline: Array<{
      title: string;
      description: string;
      completed: boolean;
      current: boolean;
    }>;
  };
}

// In-memory tracker for consecutive failed tracking lookups per IP
const failedTrackingMap = new Map<string, { count: number; resetAt: number }>();

export async function trackOrderAction(
  phone: string,
  orderNumber: string
): Promise<TrackOrderResult> {
  try {
    const clientIp = await getClientIp();

    // 1. IP Ban check (Zero DB touch for banned IPs)
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      return {
        success: false,
        message: `Tracking access restricted for ${banCheck.remainingMinutes}m due to repeated invalid searches.`,
      };
    }

    // 2. CSRF / Origin validation
    const originCheck = await verifyRequestOrigin();
    if (!originCheck.valid) {
      return {
        success: false,
        message: "Invalid request origin.",
      };
    }

    // 3. Rate Limit per IP (5 searches per 10 mins; 3 strikes = 20m IP ban)
    const rateLimit = checkRateLimit(
      `track_ip_${clientIp}`,
      5,
      10 * 60 * 1000,
      3,
      20 * 60 * 1000
    );
    if (!rateLimit.success) {
      return {
        success: false,
        message:
          rateLimit.message ||
          "Too many tracking requests. Please wait a few moments before retrying.",
      };
    }

    // 4. Input Sanitization & Malicious pattern detection
    if (hasMaliciousPattern(phone) || hasMaliciousPattern(orderNumber)) {
      penalizeMaliciousIp(clientIp, "Injected attack pattern in order tracking");
      return {
        success: false,
        message: "Security violation detected.",
      };
    }

    const cleanPhone = sanitizePhone(phone);
    const cleanOrderNumber = sanitizeText(orderNumber.toUpperCase(), 30);

    if (!cleanPhone || cleanPhone.length < 10 || !cleanOrderNumber) {
      return {
        success: false,
        message: "Please enter a valid 11-digit mobile number and Order ID.",
      };
    }

    // 5. Connect to MongoDB
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message: "Order tracking service temporarily unavailable.",
      };
    }

    // 6. Match order by orderNumber AND phone suffix (last 10 digits)
    const phoneSuffix = cleanPhone.slice(-10);
    const order = await Order.findOne({
      orderNumber: cleanOrderNumber,
      "customer.phone": { $regex: `${phoneSuffix}$` },
    }).lean();

    // 7. Track consecutive failed searches to stop brute-forcing order IDs
    const now = Date.now();
    const failRecord = failedTrackingMap.get(clientIp);

    if (!order) {
      const currentFails =
        failRecord && now < failRecord.resetAt ? failRecord.count + 1 : 1;

      failedTrackingMap.set(clientIp, {
        count: currentFails,
        resetAt: now + 10 * 60 * 1000,
      });

      if (currentFails >= 3) {
        banIp(
          clientIp,
          "Brute-forcing order tracking numbers (3 invalid attempts)",
          15 * 60 * 1000
        );
        failedTrackingMap.delete(clientIp);
        return {
          success: false,
          message:
            "Multiple incorrect order lookups. Tracking for your network is locked for 15 minutes.",
        };
      }

      return {
        success: false,
        message:
          "No matching order found. Please ensure both Order Number and Phone Number are typed correctly.",
      };
    }

    // If order found, clear failed tracking strike for this IP
    failedTrackingMap.delete(clientIp);

    const status = order.status;
    const isCancelled = status === "Cancelled";

    // 8. Mask Customer Name for privacy (e.g. "Tanvir A***d")
    const rawName = order.customer?.name || "Client";
    const maskedName =
      rawName.length > 3
        ? `${rawName.slice(0, 3)}***${rawName.slice(-1)}`
        : rawName;

    // Construct milestone timeline
    const stages: Array<{
      statusKey: OrderStatus;
      title: string;
      description: string;
    }> = [
      {
        statusKey: "Pending Verification",
        title: "Order Placed",
        description: "Your order details have been securely logged in our studio queue.",
      },
      {
        statusKey: "Confirmed",
        title: "Phone Verified",
        description: "Fulfillment team confirmed your dispatch address and phone.",
      },
      {
        statusKey: "Processing",
        title: "Studio Packaging",
        description: "Garments inspected for quality, poly-sealed, and boxed.",
      },
      {
        statusKey: "Shipped",
        title: "Handed to Courier",
        description: "Parcel in transit with courier rider for Cash on Delivery.",
      },
      {
        statusKey: "Delivered",
        title: "Delivered & Settled",
        description: "Parcel received by customer and payment collected.",
      },
    ];

    const statusOrder: OrderStatus[] = [
      "Pending Verification",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
    ];

    const currentIdx = statusOrder.indexOf(status);

    const timeline = isCancelled
      ? [
          {
            title: "Order Cancelled",
            description: "This order was cancelled by the customer or studio desk.",
            completed: true,
            current: true,
          },
        ]
      : stages.map((stage, idx) => {
          const completed = idx <= currentIdx;
          const current = idx === currentIdx;
          return {
            title: stage.title,
            description: stage.description,
            completed,
            current,
          };
        });

    return {
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: maskedName,
        deliveryZone: order.customer?.city || "Inside Dhaka",
        itemCount: order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1,
        subtotal: order.subtotal || 0,
        deliveryCharge: order.deliveryCharge || 0,
        total: order.total || 0,
        status: order.status,
        createdAt: new Date(order.createdAt).toLocaleDateString("en-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        timeline,
      },
    };
  } catch (error) {
    console.error("❌ trackOrderAction error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while searching for the order.",
    };
  }
}
