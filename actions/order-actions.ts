"use server";

import { connectToDatabase } from "@/lib/db";
import { Order, IOrder, OrderStatus } from "@/models/Order";
import { createOrderSchema } from "@/lib/validations/order";
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
import { getAdminSession } from "@/lib/auth";
import { getStoreSettingsAction } from "@/actions/settings-actions";

export interface FormattedOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: "Inside Dhaka" | "Outside Dhaka";
    notes?: string;
  };
  items: Array<{
    productId: string;
    title: string;
    size: string;
    color?: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: "CASH_ON_DELIVERY";
  status: OrderStatus;
  createdAt: Date;
}

export interface OrderActionResult {
  success: boolean;
  message?: string;
  orderNumber?: string;
  orderSummary?: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryZone: string;
    subtotal: number;
    deliveryCharge: number;
    total: number;
    itemCount: number;
  };
  isDemoMode?: boolean;
}

export async function placeOrderAction(
  rawData: unknown
): Promise<OrderActionResult> {
  try {
    const clientIp = await getClientIp();

    // 1. Check IP Ban Status (Zero DB cost for banned attackers)
    const banCheck = isIpBanned(clientIp);
    if (banCheck.banned) {
      return {
        success: false,
        message: `Your network address is temporarily blocked (${banCheck.remainingMinutes}m remaining) due to security policy violations.`,
      };
    }

    // 2. CSRF / Origin Validation
    const originCheck = await verifyRequestOrigin();
    if (!originCheck.valid) {
      penalizeMaliciousIp(clientIp, "CSRF origin mismatch violation");
      return {
        success: false,
        message: "Request origin verification failed.",
      };
    }

    // 3. Multi-Honeypot Bot Trap Check
    const payload = (rawData || {}) as Record<string, unknown>;
    const hp1 = typeof payload.website_field_hp === "string" ? payload.website_field_hp.trim() : "";
    const hp2 = typeof payload.form_verify_token_hp === "string" ? payload.form_verify_token_hp.trim() : "";

    if (hp1.length > 0 || hp2.length > 0) {
      penalizeMaliciousIp(clientIp, "Filled hidden honeypot traps");
      console.warn("🛡️ Spam bot trapped and IP banned instantly:", clientIp);
      return {
        success: false,
        message: "Automated submission rejected.",
      };
    }

    // 4. Anti-Bot Timing Defense (Humans need > 2.2 seconds to fill checkout)
    if (typeof payload.formLoadedAt === "number") {
      const elapsedMs = Date.now() - payload.formLoadedAt;
      if (elapsedMs < 2200) {
        penalizeMaliciousIp(clientIp, `Suspicious sub-second bot submission (${elapsedMs}ms)`);
        console.warn(`🛡️ Sub-second automated bot detected (${elapsedMs}ms) from IP: ${clientIp}`);
        return {
          success: false,
          message: "Form submitted unusually fast. Please try again normally.",
        };
      }
    }

    // 5. Malicious Injection Pattern Check (XSS, NoSQL, SQLi)
    const rawStringified = JSON.stringify(rawData);
    if (hasMaliciousPattern(rawStringified)) {
      penalizeMaliciousIp(clientIp, "Detected script injection or database attack pattern");
      return {
        success: false,
        message: "Malicious input sequence detected and blocked.",
      };
    }

    // 6. IP-based Rate Limiting (Max 4 orders per 5 mins; 3 strikes = 30m IP Ban)
    const rateLimit = checkRateLimit(
      `order_ip_${clientIp}`,
      4,
      5 * 60 * 1000,
      3,
      30 * 60 * 1000
    );
    if (!rateLimit.success) {
      return {
        success: false,
        message:
          rateLimit.message ||
          "Too many order attempts detected from this network. Please wait a few moments.",
      };
    }

    // 7. Strict Zod Validation
    const validation = createOrderSchema.safeParse(rawData);
    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Validation failed";
      return {
        success: false,
        message: firstError,
      };
    }

    const data = validation.data;

    // 8. Sanitize all user strings before database ingestion (Prevent Stored XSS)
    const sanitizedName = sanitizeText(data.customerName, 80);
    const sanitizedPhone = sanitizePhone(data.customerPhone);
    const sanitizedAddress = sanitizeText(data.deliveryAddress, 250);
    const sanitizedNotes = data.specialNotes
      ? sanitizeText(data.specialNotes, 300)
      : undefined;

    if (!sanitizedName || !sanitizedPhone || !sanitizedAddress) {
      return {
        success: false,
        message: "Please provide valid customer details without restricted symbols.",
      };
    }

    // 9. Phone Velocity Limiter (Max 2 orders per phone number per 15 minutes)
    const phoneRateLimit = checkRateLimit(
      `phone_vel_${sanitizedPhone}`,
      2,
      15 * 60 * 1000,
      4,
      60 * 60 * 1000
    );
    if (!phoneRateLimit.success) {
      return {
        success: false,
        message:
          "Multiple orders recently placed with this phone number. Please await confirmation call or contact our helpline.",
      };
    }

    // 10. Financial calculation with Dynamic Store Settings
    const settings = await getStoreSettingsAction();
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let deliveryCharge =
      data.deliveryZone === "Inside Dhaka"
        ? settings.deliveryInsideDhaka
        : settings.deliveryOutsideDhaka;

    // Free shipping threshold check if configured
    if (
      settings.freeShippingThreshold > 0 &&
      subtotal >= settings.freeShippingThreshold
    ) {
      deliveryCharge = 0;
    }

    const total = subtotal + deliveryCharge;

    // 11. Connect to MongoDB
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message:
          "Database connection unavailable. Please contact customer support or try again shortly.",
      };
    }

    // 12. Duplicate Order Deduplication (Within last 90 seconds from same phone)
    const recentDuplicate = await Order.findOne({
      "customer.phone": sanitizedPhone,
      total,
      createdAt: { $gte: new Date(Date.now() - 90 * 1000) },
    }).lean();

    if (recentDuplicate) {
      return {
        success: false,
        message:
          "An identical order was received from this phone number moments ago. Please avoid duplicate submissions.",
      };
    }

    // 13. Generate human-friendly Order ID (e.g. #ORD-2026-92814)
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomDigits}`;

    // 14. Database insertion
    await Order.create({
      orderNumber,
      customer: {
        name: sanitizedName,
        phone: sanitizedPhone,
        address: sanitizedAddress,
        city: data.deliveryZone,
        notes: sanitizedNotes,
      },
      items: data.items.map((it) => ({
        productId: it.productId,
        title: sanitizeText(it.title, 120),
        size: sanitizeText(it.size, 20),
        color: it.color ? sanitizeText(it.color, 30) : undefined,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      })),
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: "CASH_ON_DELIVERY",
      status: "Pending Verification",
      ipAddress: clientIp,
    });

    return {
      success: true,
      orderNumber,
      orderSummary: {
        orderNumber,
        customerName: sanitizedName,
        customerPhone: sanitizedPhone,
        deliveryAddress: sanitizedAddress,
        deliveryZone: data.deliveryZone,
        subtotal,
        deliveryCharge,
        total,
        itemCount: data.items.reduce((acc, i) => acc + i.quantity, 0),
      },
      isDemoMode: false,
    };
  } catch (error) {
    console.error("❌ placeOrderAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while placing your order. Please try again.",
    };
  }
}

function formatOrder(doc: Record<string, unknown> | IOrder): FormattedOrder {
  const o = doc as Record<string, unknown>;
  const customer = (o.customer || {}) as Record<string, unknown>;
  const rawItems = Array.isArray(o.items) ? o.items : [];

  return {
    _id: String(o._id || ""),
    orderNumber: String(o.orderNumber || ""),
    customer: {
      name: String(customer.name || "Customer"),
      phone: String(customer.phone || ""),
      address: String(customer.address || ""),
      city:
        customer.city === "Outside Dhaka"
          ? "Outside Dhaka"
          : "Inside Dhaka",
      notes: customer.notes ? String(customer.notes) : undefined,
    },
    items: rawItems.map((it: unknown) => {
      const item = (it || {}) as Record<string, unknown>;
      return {
        productId: String(item.productId || ""),
        title: String(item.title || "Apparel Item"),
        size: String(item.size || "Standard"),
        color: item.color ? String(item.color) : undefined,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        image: String(
          item.image ||
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop"
        ),
      };
    }),
    subtotal: Number(o.subtotal || 0),
    deliveryCharge: Number(o.deliveryCharge || 0),
    total: Number(o.total || 0),
    paymentMethod: "CASH_ON_DELIVERY",
    status: (o.status as OrderStatus) || "Pending Verification",
    createdAt:
      o.createdAt instanceof Date
        ? o.createdAt
        : new Date(String(o.createdAt || Date.now())),
  };
}

export interface GetOrdersOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface GetOrdersResult {
  success: boolean;
  message?: string;
  orders: FormattedOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  source?: string;
}

/**
 * Fetch orders for the brand admin portal (Strictly Session-Protected with Pagination)
 */
export async function getOrdersAction(
  options: GetOrdersOptions = {}
): Promise<GetOrdersResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      success: false,
      message: "Unauthorized access. Please login with admin credentials.",
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 25));
  const { status, search } = options;

  try {
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message: "Database connection failed",
        orders: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    const query: Record<string, unknown> = {};
    if (status && status !== "All") {
      query.status = status;
    }

    if (search && search.trim().length > 0) {
      const term = sanitizeText(search.trim(), 50);
      query.$or = [
        { orderNumber: { $regex: term, $options: "i" } },
        { "customer.name": { $regex: term, $options: "i" } },
        { "customer.phone": { $regex: term, $options: "i" } },
      ];
    }

    const totalCount = await Order.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      success: true,
      orders: orders.map((o) =>
        formatOrder(o as unknown as Record<string, unknown>)
      ),
      totalCount,
      totalPages,
      currentPage: page,
      source: "MongoDB Atlas",
    };
  } catch (err) {
    console.error("❌ getOrdersAction error:", err);
    return {
      success: false,
      message: "Failed to retrieve orders",
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

/**
 * Update order status (e.g. Confirmed, Shipped, Delivered) - Session-Protected Only
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; message?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, message: "Unauthorized access. Session expired." };
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection unavailable." };
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: "Order not found." };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ updateOrderStatusAction error:", error);
    return { success: false, message: "Failed to update order status." };
  }
}

/**
 * Get comprehensive business analytics and KPIs - Session-Protected Only
 */
export async function getBusinessDashboardMetricsAction() {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, message: "Unauthorized access." };
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection unavailable." };
    }

    const dbOrders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const ordersList = dbOrders.map((o) =>
      formatOrder(o as unknown as Record<string, unknown>)
    );

    const totalOrders = ordersList.length;
    const deliveredOrders = ordersList.filter((o) => o.status === "Delivered");
    const confirmedOrders = ordersList.filter(
      (o) => o.status === "Confirmed" || o.status === "Shipped"
    );
    const pendingVerification = ordersList.filter(
      (o) => o.status === "Pending Verification"
    );
    const cancelledOrders = ordersList.filter((o) => o.status === "Cancelled");

    const grossRevenue = ordersList
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const netRealizedRevenue = deliveredOrders.reduce(
      (sum, o) => sum + o.total,
      0
    );

    const averageOrderValue =
      totalOrders > 0 ? Math.round(grossRevenue / (totalOrders || 1)) : 0;

    return {
      success: true,
      metrics: {
        totalOrders,
        grossRevenue,
        netRealizedRevenue,
        averageOrderValue,
        pendingVerificationCount: pendingVerification.length,
        deliveredCount: deliveredOrders.length,
        confirmedCount: confirmedOrders.length,
        cancelledCount: cancelledOrders.length,
      },
      recentOrders: ordersList.slice(0, 10),
    };
  } catch (error) {
    console.error("❌ getBusinessDashboardMetricsAction error:", error);
    return { success: false, message: "Failed to fetch metrics" };
  }
}
