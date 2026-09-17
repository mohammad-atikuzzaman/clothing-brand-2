"use server";

import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Order, IOrder, OrderStatus } from "@/models/Order";
import { createOrderSchema } from "@/lib/validations/order";
import { checkRateLimit } from "@/lib/rate-limit";

// Temporary fallback in-memory store for orders if MongoDB is not yet configured by user
const inMemoryOrders: Array<{
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
}> = [];

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
    // 1. IP extraction & Rate Limiting Check
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : headersList.get("x-real-ip") || "127.0.0.1";

    const rateLimit = checkRateLimit(`order_${clientIp}`, 4, 3 * 60 * 1000); // 4 orders per 3 mins per IP
    if (!rateLimit.success) {
      return {
        success: false,
        message:
          "Too many order attempts detected from this network. Please wait a few moments or contact support.",
      };
    }

    // 2. Honeypot Anti-Spam Check
    const payload = rawData as Record<string, unknown>;
    if (payload && typeof payload.website_field_hp === "string" && payload.website_field_hp.trim().length > 0) {
      // Bot detected! Return fake success or reject silently
      console.warn("🛡️ Spam bot detected via honeypot trap from IP:", clientIp);
      return {
        success: false,
        message: "Invalid submission detected.",
      };
    }

    // 3. Strict Zod Validation
    const validation = createOrderSchema.safeParse(rawData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Validation failed";
      return {
        success: false,
        message: firstError,
      };
    }

    const data = validation.data;

    // 4. Financial calculation
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryCharge = data.deliveryZone === "Inside Dhaka" ? 70 : 130;
    const total = subtotal + deliveryCharge;

    // 5. Generate human-friendly Order ID (e.g. #ORD-2026-92814)
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomDigits}`;

    // 6. Database insertion via cached Mongoose pool
    const db = await connectToDatabase();

    if (db) {
      await Order.create({
        orderNumber,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          address: data.deliveryAddress,
          city: data.deliveryZone,
          notes: data.specialNotes,
        },
        items: data.items,
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
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryZone: data.deliveryZone,
          subtotal,
          deliveryCharge,
          total,
          itemCount: data.items.reduce((acc, i) => acc + i.quantity, 0),
        },
        isDemoMode: false,
      };
    } else {
      // Fallback in-memory store if MongoDB URI is not provided yet
      const fallbackRecord = {
        _id: `mem_${Date.now()}`,
        orderNumber,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          address: data.deliveryAddress,
          city: data.deliveryZone,
          notes: data.specialNotes,
        },
        items: data.items,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: "CASH_ON_DELIVERY" as const,
        status: "Pending Verification" as OrderStatus,
        createdAt: new Date(),
      };
      inMemoryOrders.unshift(fallbackRecord);

      return {
        success: true,
        orderNumber,
        orderSummary: {
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryZone: data.deliveryZone,
          subtotal,
          deliveryCharge,
          total,
          itemCount: data.items.reduce((acc, i) => acc + i.quantity, 0),
        },
        isDemoMode: true,
      };
    }
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

/**
 * Fetch orders for the brand admin portal
 */
export async function getOrdersAction(secretKey?: string) {
  const expectedKey = process.env.ADMIN_SECRET_KEY || "admin12345";
  if (secretKey !== expectedKey) {
    return {
      success: false,
      message: "Unauthorized access. Invalid Admin Secret Key.",
      orders: [],
    };
  }

  try {
    const db = await connectToDatabase();
    if (db) {
      const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return {
        success: true,
        orders: JSON.parse(JSON.stringify(orders)),
        source: "MongoDB",
      };
    }

    return {
      success: true,
      orders: inMemoryOrders,
      source: "Memory (Local Demo)",
    };
  } catch (err) {
    console.error("❌ getOrdersAction error:", err);
    return {
      success: false,
      message: "Failed to retrieve orders",
      orders: inMemoryOrders,
    };
  }
}

/**
 * Update order status (e.g. Confirmed, Shipped, Delivered)
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  secretKey?: string
) {
  const expectedKey = process.env.ADMIN_SECRET_KEY || "admin12345";
  if (secretKey !== expectedKey) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const db = await connectToDatabase();
    if (db) {
      await Order.findByIdAndUpdate(orderId, { status: newStatus });
      return { success: true };
    }

    const order = inMemoryOrders.find((o) => o._id === orderId);
    if (order) {
      order.status = newStatus;
    }
    return { success: true };
  } catch (error) {
    console.error("❌ updateOrderStatusAction error:", error);
    return { success: false, message: "Failed to update status" };
  }
}
