"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { StoreSettingsType } from "@/lib/settings-types";
import { trackOrderAction, TrackOrderResult } from "@/actions/track-actions";
import { formatCurrency } from "@/lib/utils";

export function TrackOrderClient({
  settings,
}: {
  settings: StoreSettingsType;
}) {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackOrderResult["order"] | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const res = await trackOrderAction(phone, orderNumber);
      if (res.success && res.order) {
        setResult(res.order);
      } else {
        setError(
          res.message || "Order not found. Please verify your details."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar settings={settings} />
      <CartDrawer />

      <main className="flex-grow">
        {/* Banner */}
        <section className="bg-neutral-950 text-white py-16 sm:py-20 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono uppercase tracking-widest mb-4">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Live Parcel Dispatch
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Track Your Order Status
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Enter the Order ID from your confirmation screen or SMS along with
              your registered phone number.
            </p>
          </div>
        </section>

        {/* Form Container */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-sm">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Order Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-260918-1234"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono text-sm text-neutral-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono text-sm text-neutral-900"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Studio Archives...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tracking Result Card */}
          {result && (
            <div className="mt-8 bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                    Order Identification
                  </span>
                  <h2 className="text-xl font-black text-neutral-900 font-mono mt-0.5">
                    {result.orderNumber}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Recipient: <strong>{result.customerName}</strong> • Placed on {result.createdAt}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      result.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : result.status === "Cancelled"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-sky-100 text-sky-800 border border-sky-300"
                    }`}
                  >
                    {result.status}
                  </span>
                  <div className="text-xs font-bold text-neutral-900 mt-1 font-mono">
                    Total: {formatCurrency(result.total)} (COD)
                  </div>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="space-y-6 py-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Fulfillment Pipeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {result.timeline.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          step.completed
                            ? "bg-neutral-900 border-neutral-900 text-white"
                            : "bg-white border-neutral-300 text-transparent"
                        }`}
                      >
                        {step.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <div className="text-xs">
                        <div
                          className={`font-bold ${
                            step.current
                              ? "text-neutral-950 font-extrabold text-sm"
                              : step.completed
                              ? "text-neutral-800"
                              : "text-neutral-400"
                          }`}
                        >
                          {step.title}
                          {step.current && (
                            <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              Current Status
                            </span>
                          )}
                        </div>
                        <div className="text-neutral-500 mt-0.5 leading-relaxed">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concierge Help Callout */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl">
                <div>
                  Need immediate address correction or delivery reschedule?
                </div>
                <a
                  href={`tel:${settings.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Hotline
                </a>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
