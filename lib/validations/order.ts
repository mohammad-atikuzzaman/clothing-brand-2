import { z } from "zod";

// Phone validation: allows 01XXXXXXXXX or +8801XXXXXXXXX or 8801XXXXXXXXX
const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  title: z.string().min(1, "Title required"),
  size: z.string().min(1, "Size required"),
  color: z.string().optional(),
  price: z.number().positive("Price must be greater than zero"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  image: z.string().url("Valid image URL required"),
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  customerPhone: z
    .string()
    .trim()
    .regex(
      bdPhoneRegex,
      "Please enter a valid 11-digit Bangladeshi phone number (e.g. 017XXXXXXXX)"
    ),
  deliveryAddress: z
    .string()
    .trim()
    .min(8, "Please enter your full delivery address with house/road/area")
    .max(250, "Address is too long"),
  deliveryZone: z.enum(["Inside Dhaka", "Outside Dhaka"]),
  specialNotes: z.string().trim().max(300).optional(),
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
  // Honeypot field: invisible to humans, auto-filled by automated spam bots
  website_field_hp: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
