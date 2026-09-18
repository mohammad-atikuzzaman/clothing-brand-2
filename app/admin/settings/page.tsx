"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Globe,
  Truck,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Share2,
} from "lucide-react";
import {
  getStoreSettingsAction,
  updateStoreSettingsAction,
} from "@/actions/settings-actions";
import { StoreSettingsType, DEFAULT_STORE_SETTINGS } from "@/lib/settings-types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsType>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    getStoreSettingsAction().then((res) => {
      setSettings(res);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof StoreSettingsType, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await updateStoreSettingsAction(settings);
    setSaving(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message });
      if (res.settings) {
        setSettings(res.settings);
      }
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.message });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-neutral-500 text-sm">
          <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading store settings & contacts...</span>
        </div>
      </div>
    );
  }

  // Generate clean WhatsApp link
  const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            Global Store Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Store Contacts & Socials
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Control your hotline, WhatsApp, showroom address, Facebook, Instagram, and announcement banner across the entire website.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Direct Support Channels */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-700" />
              Direct Customer Concierge & Hotline
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              These details appear in the top navbar, mobile drawer, contact desk, and order follow-up cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Hotline Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+880 1888-299388"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                />
                <a
                  href={`tel:${settings.phone}`}
                  title="Test Call"
                  className="absolute right-2.5 top-2.5 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Direct voice call format (e.g. +880 1888-299388)
              </p>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Official WhatsApp Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="+880 1888-299388"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                />
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Test WhatsApp Link"
                  className="absolute right-2.5 top-2.5 p-1 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Generates instant click-to-chat links for customers
              </p>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Customer Support Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="concierge@noiratelier.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Displayed in the footer and privacy policy documents
              </p>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Operating / Support Hours
              </label>
              <input
                type="text"
                value={settings.supportHours}
                onChange={(e) => handleChange("supportHours", e.target.value)}
                placeholder="Everyday: 10:00 AM - 10:00 PM BST"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Shown to reassure clients when dispatchers are available
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Physical Studio & Showroom Address */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-700" />
              Studio Showroom & Headquarter Location
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              The physical dispatch hub shown in the footer and contact page.
            </p>
          </div>

          <div className="text-xs">
            <label className="font-bold text-neutral-700 block mb-1.5">
              Full Physical Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Level 4, Plot 18, Road 11, Block D, Banani, Dhaka - 1213"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
            />
          </div>
        </div>

        {/* Section 3: Social Media Links */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-neutral-700" />
              Social Media Channels
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Connect your official social channels. Icons in the footer and contact desk will point directly here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/noiratelier.bd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/noiratelier.studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                YouTube Channel URL (Optional)
              </label>
              <input
                type="url"
                value={settings.youtubeUrl || ""}
                onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/@noiratelier"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                TikTok Profile URL (Optional)
              </label>
              <input
                type="url"
                value={settings.tiktokUrl || ""}
                onChange={(e) => handleChange("tiktokUrl", e.target.value)}
                placeholder="https://tiktok.com/@noiratelier"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Announcement & Delivery Rules */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-700" />
              Storefront Announcement & Delivery Fees
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage the top announcement bar and nationwide courier delivery charges.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Top Announcement Bar Text
              </label>
              <input
                type="text"
                value={settings.announcement}
                onChange={(e) => handleChange("announcement", e.target.value)}
                placeholder="Cash on Delivery (COD) Available Nationwide • No Advance Payment Required"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-bold text-neutral-700 block mb-1.5">
                  Inside Dhaka Delivery (৳)
                </label>
                <input
                  type="number"
                  value={settings.deliveryInsideDhaka}
                  onChange={(e) =>
                    handleChange("deliveryInsideDhaka", e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1.5">
                  Outside Dhaka Delivery (৳)
                </label>
                <input
                  type="number"
                  value={settings.deliveryOutsideDhaka}
                  onChange={(e) =>
                    handleChange("deliveryOutsideDhaka", e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1.5">
                  Free Shipping Minimum Cart (৳)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    handleChange("freeShippingThreshold", e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save All Store Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
