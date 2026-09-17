"use client";

import React from "react";
import { CheckCircle2, PhoneCall, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { OrderActionResult } from "@/actions/order-actions";
import { formatCurrency } from "@/lib/utils";

interface OrderSuccessModalProps {
  orderResult: OrderActionResult | null;
  onClose: () => void;
}

export function OrderSuccessModal({
  orderResult,
  onClose,
}: OrderSuccessModalProps) {
  if (!orderResult || !orderResult.success || !orderResult.orderSummary) {
    return null;
  }

  const {
    orderNumber,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryZone,
    total,
  } = orderResult.orderSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
          Cash on Delivery Order Placed
        </span>

        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
          Thank You, {customerName.split(" ")[0]}!
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Your order has been recorded successfully. Please keep your phone reachable.
        </p>

        {/* Order Receipt Box */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
            <span className="text-neutral-500 font-medium">Order Number</span>
            <span className="font-mono font-extrabold text-neutral-950 text-sm">
              #{orderNumber}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">Contact Number:</span>
            <span className="font-semibold text-neutral-900">
              {customerPhone}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">Destination:</span>
            <span className="font-semibold text-neutral-900">
              {deliveryZone}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-500">Address:</span>
            <span className="font-semibold text-neutral-900 text-right max-w-[200px] truncate">
              {deliveryAddress}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-black text-neutral-950">
            <span>Pay on Delivery:</span>
            <span className="text-base text-emerald-700">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Dispatch Next Steps Callout */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-left flex gap-3 text-xs text-amber-950">
          <PhoneCall className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">What happens next?</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              আমাদের টিম খুব শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি কনফার্ম করবে।
              কনফার্মেশনের পর পার্সেল রাইডারের মাধ্যমে পাঠিয়ে দেওয়া হবে।
            </p>
          </div>
        </div>

        {orderResult.isDemoMode && (
          <p className="mt-3 text-[10px] text-neutral-400 font-mono">
            ℹ️ Saved in local memory (MongoDB URI can be configured anytime in .env.local).
          </p>
        )}

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
