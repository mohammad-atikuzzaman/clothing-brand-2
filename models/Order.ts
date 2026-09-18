import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus =
  | "Pending Verification"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface IOrderItem {
  productId: string;
  title: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: "Inside Dhaka" | "Outside Dhaka";
    notes?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: "CASH_ON_DELIVERY";
  status: OrderStatus;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
});

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true, index: true },
      address: { type: String, required: true, trim: true },
      city: {
        type: String,
        required: true,
        enum: ["Inside Dhaka", "Outside Dhaka"],
      },
      notes: { type: String, trim: true },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      default: "CASH_ON_DELIVERY",
      enum: ["CASH_ON_DELIVERY"],
    },
    status: {
      type: String,
      default: "Pending Verification",
      enum: [
        "Pending Verification",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      index: true,
    },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.phone": 1, createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
