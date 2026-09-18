"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { ContactInquiry, InquiryStatus, IContactInquiry } from "@/models/ContactInquiry";
import { getAdminSession } from "@/lib/auth";

export interface FormattedInquiry {
  _id: string;
  name: string;
  phone: string;
  orderId?: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  createdAt: Date;
}

function formatInquiry(doc: unknown): FormattedInquiry {
  const i = doc as Record<string, unknown>;
  return {
    _id: String(i._id || ""),
    name: String(i.name || ""),
    phone: String(i.phone || ""),
    orderId: i.orderId ? String(i.orderId) : undefined,
    subject: String(i.subject || ""),
    message: String(i.message || ""),
    status: (i.status as InquiryStatus) || "New",
    adminNotes: i.adminNotes ? String(i.adminNotes) : undefined,
    createdAt: i.createdAt instanceof Date ? i.createdAt : new Date(String(i.createdAt || Date.now())),
  };
}

export async function getInquiriesAction(): Promise<{
  success: boolean;
  message?: string;
  inquiries: FormattedInquiry[];
}> {
  const session = await getAdminSession();
  if (!session) {
    return {
      success: false,
      message: "Unauthorized access. Please login.",
      inquiries: [],
    };
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message: "Database connection unavailable.",
        inquiries: [],
      };
    }

    const items = await ContactInquiry.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return {
      success: true,
      inquiries: items.map(formatInquiry),
    };
  } catch (error) {
    console.error("❌ getInquiriesAction error:", error);
    return {
      success: false,
      message: "Failed to fetch inquiries.",
      inquiries: [],
    };
  }
}

export async function updateInquiryStatusAction(
  inquiryId: string,
  newStatus: InquiryStatus,
  adminNotes?: string
): Promise<{ success: boolean; message?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, message: "Unauthorized access." };
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection unavailable." };
    }

    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (adminNotes !== undefined) {
      updatePayload.adminNotes = adminNotes;
    }

    const updated = await ContactInquiry.findByIdAndUpdate(
      inquiryId,
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return { success: false, message: "Inquiry not found." };
    }

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (error) {
    console.error("❌ updateInquiryStatusAction error:", error);
    return { success: false, message: "Failed to update inquiry." };
  }
}
