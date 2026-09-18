import mongoose, { Schema, Document, Model } from "mongoose";

export type InquiryStatus = "New" | "Responded" | "Closed";

export interface IContactInquiry extends Document {
  name: string;
  phone: string;
  orderId?: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    orderId: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      default: "New",
      enum: ["New", "Responded", "Closed"],
      index: true,
    },
    adminNotes: { type: String, trim: true },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

ContactInquirySchema.index({ createdAt: -1 });
ContactInquirySchema.index({ status: 1, createdAt: -1 });

export const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry ||
  mongoose.model<IContactInquiry>("ContactInquiry", ContactInquirySchema);
