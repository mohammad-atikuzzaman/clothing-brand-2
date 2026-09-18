import mongoose, { Schema, Document, Model } from "mongoose";
import { StoreSettingsType, DEFAULT_STORE_SETTINGS } from "@/lib/settings-types";

export type { StoreSettingsType };
export { DEFAULT_STORE_SETTINGS };

export interface IStoreSettings extends Document {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  supportHours: string;
  announcement: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeShippingThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema(
  {
    phone: { type: String, default: DEFAULT_STORE_SETTINGS.phone },
    email: { type: String, default: DEFAULT_STORE_SETTINGS.email },
    whatsapp: { type: String, default: DEFAULT_STORE_SETTINGS.whatsapp },
    address: { type: String, default: DEFAULT_STORE_SETTINGS.address },
    facebookUrl: { type: String, default: DEFAULT_STORE_SETTINGS.facebookUrl },
    instagramUrl: { type: String, default: DEFAULT_STORE_SETTINGS.instagramUrl },
    youtubeUrl: { type: String, default: DEFAULT_STORE_SETTINGS.youtubeUrl },
    tiktokUrl: { type: String, default: DEFAULT_STORE_SETTINGS.tiktokUrl },
    supportHours: { type: String, default: DEFAULT_STORE_SETTINGS.supportHours },
    announcement: { type: String, default: DEFAULT_STORE_SETTINGS.announcement },
    deliveryInsideDhaka: { type: Number, default: DEFAULT_STORE_SETTINGS.deliveryInsideDhaka },
    deliveryOutsideDhaka: { type: Number, default: DEFAULT_STORE_SETTINGS.deliveryOutsideDhaka },
    freeShippingThreshold: { type: Number, default: DEFAULT_STORE_SETTINGS.freeShippingThreshold },
  },
  {
    timestamps: true,
  }
);

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
