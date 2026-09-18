"use server";

import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { verifyAdminGuard } from "@/lib/auth";
import { getClientIp, verifyRequestOrigin } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";

export async function uploadProductImageAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> {
  try {
    // 1. Session verification guard (only logged-in admins can upload)
    await verifyAdminGuard();

    const originCheck = await verifyRequestOrigin();
    if (!originCheck.valid) {
      return { success: false, message: "Invalid request origin." };
    }

    const clientIp = await getClientIp();
    const rateLimit = checkRateLimit(`upload_${clientIp}`, 20, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return { success: false, message: "Upload limit exceeded. Please wait a few moments." };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "No image file provided." };
    }

    // 2. Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: "Image size must be less than 8MB." };
    }

    // 3. Validate image mime type
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/jpg",
    ];
    if (!validMimes.includes(file.type)) {
      return {
        success: false,
        message: "Only JPG, PNG, WEBP, and AVIF images are supported.",
      };
    }

    // 4. Convert File to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Server-side upload to Cloudinary
    const result = await uploadImageToCloudinary(buffer, "noir_atelier_products");

    if (result.success && result.url) {
      return {
        success: true,
        url: result.url,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to upload to Cloudinary.",
    };
  } catch (error) {
    console.error("❌ uploadProductImageAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unexpected server error during image upload.",
    };
  }
}
