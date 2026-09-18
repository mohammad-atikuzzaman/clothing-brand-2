import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  message?: string;
}

/**
 * Uploads a Buffer (image) directly to Cloudinary on the server side
 * Transforms to optimal WebP/AVIF format with compression
 */
export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folder: string = "noir_atelier_clothing"
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      message:
        "Cloudinary credentials missing in .env.local (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
    };
  }

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error("❌ Cloudinary upload error:", error);
          resolve({
            success: false,
            message: error?.message || "Cloudinary upload failed.",
          });
        } else {
          resolve({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;
