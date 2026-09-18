"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import {
  StoreSettings,
  StoreSettingsType,
  DEFAULT_STORE_SETTINGS,
} from "@/models/StoreSettings";
import { getAdminSession } from "@/lib/auth";

/**
 * Retrieves public store settings (contacts, social links, announcement, delivery rates)
 */
export async function getStoreSettingsAction(): Promise<StoreSettingsType> {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return DEFAULT_STORE_SETTINGS;
    }

    let settings = await StoreSettings.findOne().lean();

    if (!settings) {
      // Seed default settings into DB
      const created = await StoreSettings.create(DEFAULT_STORE_SETTINGS);
      settings = created.toObject();
    }

    return {
      phone: settings.phone || DEFAULT_STORE_SETTINGS.phone,
      email: settings.email || DEFAULT_STORE_SETTINGS.email,
      whatsapp: settings.whatsapp || DEFAULT_STORE_SETTINGS.whatsapp,
      address: settings.address || DEFAULT_STORE_SETTINGS.address,
      facebookUrl: settings.facebookUrl || DEFAULT_STORE_SETTINGS.facebookUrl,
      instagramUrl: settings.instagramUrl || DEFAULT_STORE_SETTINGS.instagramUrl,
      youtubeUrl: settings.youtubeUrl || DEFAULT_STORE_SETTINGS.youtubeUrl,
      tiktokUrl: settings.tiktokUrl || DEFAULT_STORE_SETTINGS.tiktokUrl,
      supportHours: settings.supportHours || DEFAULT_STORE_SETTINGS.supportHours,
      announcement: settings.announcement || DEFAULT_STORE_SETTINGS.announcement,
      deliveryInsideDhaka:
        typeof settings.deliveryInsideDhaka === "number"
          ? settings.deliveryInsideDhaka
          : DEFAULT_STORE_SETTINGS.deliveryInsideDhaka,
      deliveryOutsideDhaka:
        typeof settings.deliveryOutsideDhaka === "number"
          ? settings.deliveryOutsideDhaka
          : DEFAULT_STORE_SETTINGS.deliveryOutsideDhaka,
      freeShippingThreshold:
        typeof settings.freeShippingThreshold === "number"
          ? settings.freeShippingThreshold
          : DEFAULT_STORE_SETTINGS.freeShippingThreshold,
      metaPixelId: settings.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
      metaCapiToken: settings.metaCapiToken || process.env.META_CAPI_ACCESS_TOKEN || "",
      metaTestEventCode: settings.metaTestEventCode || process.env.META_TEST_EVENT_CODE || "",
      facebookDomainVerification: settings.facebookDomainVerification || process.env.FACEBOOK_DOMAIN_VERIFICATION || "",
    };
  } catch (error) {
    console.error("getStoreSettingsAction error:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}

/**
 * Updates store contacts and operational settings (Admin Only)
 */
export async function updateStoreSettingsAction(
  data: Partial<StoreSettingsType>
): Promise<{ success: boolean; message: string; settings?: StoreSettingsType }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, message: "Unauthorized. Admin session required." };
    }

    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection failed." };
    }

    let settingsDoc = await StoreSettings.findOne();

    if (!settingsDoc) {
      settingsDoc = new StoreSettings(DEFAULT_STORE_SETTINGS);
    }

    // Apply updates
    if (data.phone !== undefined) settingsDoc.phone = data.phone.trim();
    if (data.email !== undefined) settingsDoc.email = data.email.trim();
    if (data.whatsapp !== undefined) settingsDoc.whatsapp = data.whatsapp.trim();
    if (data.address !== undefined) settingsDoc.address = data.address.trim();
    if (data.facebookUrl !== undefined) settingsDoc.facebookUrl = data.facebookUrl.trim();
    if (data.instagramUrl !== undefined) settingsDoc.instagramUrl = data.instagramUrl.trim();
    if (data.youtubeUrl !== undefined) settingsDoc.youtubeUrl = data.youtubeUrl.trim();
    if (data.tiktokUrl !== undefined) settingsDoc.tiktokUrl = data.tiktokUrl.trim();
    if (data.supportHours !== undefined) settingsDoc.supportHours = data.supportHours.trim();
    if (data.announcement !== undefined) settingsDoc.announcement = data.announcement.trim();
    if (data.deliveryInsideDhaka !== undefined)
      settingsDoc.deliveryInsideDhaka = Number(data.deliveryInsideDhaka);
    if (data.deliveryOutsideDhaka !== undefined)
      settingsDoc.deliveryOutsideDhaka = Number(data.deliveryOutsideDhaka);
    if (data.freeShippingThreshold !== undefined)
      settingsDoc.freeShippingThreshold = Number(data.freeShippingThreshold);
    if (data.metaPixelId !== undefined) settingsDoc.metaPixelId = data.metaPixelId.trim();
    if (data.metaCapiToken !== undefined) settingsDoc.metaCapiToken = data.metaCapiToken.trim();
    if (data.metaTestEventCode !== undefined) settingsDoc.metaTestEventCode = data.metaTestEventCode.trim();
    if (data.facebookDomainVerification !== undefined)
      settingsDoc.facebookDomainVerification = data.facebookDomainVerification.trim();

    await settingsDoc.save();

    // Revalidate all cached static pages (Home, About, Contact, Privacy, etc.)
    revalidatePath("/", "layout");

    const plainSettings = JSON.parse(JSON.stringify(settingsDoc));

    return {
      success: true,
      message: "Store contact & operational settings updated successfully.",
      settings: plainSettings,
    };
  } catch (error) {
    console.error("updateStoreSettingsAction error:", error);
    return { success: false, message: "Failed to update store settings." };
  }
}
