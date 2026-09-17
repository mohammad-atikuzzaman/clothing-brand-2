import mongoose, { Schema, Document, Model } from "mongoose";

export interface IColor {
  name: string;
  hex: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: "Men" | "Women" | "Minimalist" | "Accessories";
  sizes: string[];
  colors: IColor[];
  images: string[];
  inStock: boolean;
  featured: boolean;
  tag?: string;
  fabric?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Minimalist", "Accessories"],
      index: true,
    },
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    images: { type: [String], required: true },
    inStock: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    tag: { type: String },
    fabric: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development hot-reload
export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
