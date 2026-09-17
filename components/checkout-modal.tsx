"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Loader2, Truck, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { placeOrderAction, OrderActionResult } from "@/actions/order-actions";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (result: OrderActionResult) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const items = useCartStore((s) => s.items);
  const deliveryZone = useCartStore((s) => s.deliveryZone);
  const setDeliveryZone = useCartStore((s) => s.setDeliveryZone);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryCharge = useCartStore((s) => s.deliveryCharge());
  const grandTotal = useCartStore((s) => s.grandTotal());
  const clearCart = useCartStore((s) => s.clearCart);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-bot trap

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time phone check for UX
  const isPhoneValid = /^(?:\+?88)?01[3-9]\d{8}$/.test(customerPhone.trim());

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return;
    }

    if (!isPhoneValid) {
      setErrorMessage(
        "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678)."
      );
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryZone,
        specialNotes: specialNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          size: i.size,
          color: i.color,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        website_field_hp: honeypot, // Honeypot trap
      };

      const result = await placeOrderAction(payload);

      if (result.success) {
        clearCart();
        onClose();
        onOrderSuccess(result);
      } else {
        setErrorMessage(
          result.message || "Failed to process order. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Cash on Delivery Checkout
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Complete Your Order
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            No advance payment needed. We will call you to confirm your size and
            shipping details before dispatching.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-4">
          {/* Honeypot field (hidden from real users, traps bots) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_field_hp">Leave empty</label>
            <input
              type="text"
              id="website_field_hp"
              name="website_field_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tanvir Ahmed"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Mobile Number with Bangladeshi format check */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              {customerPhone.length > 0 && (
                <span
                  className={`text-[11px] font-semibold ${
                    isPhoneValid ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {isPhoneValid ? "✓ Valid BD Number" : "11 digits required (01...)"}
                </span>
              )}
            </div>
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              We will call this number for order confirmation before packaging.
            </p>
          </div>

          {/* Delivery Zone Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Delivery Location <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryZone("Inside Dhaka")}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  deliveryZone === "Inside Dhaka"
                    ? "border-neutral-900 bg-neutral-900 text-white shadow"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div>Inside Dhaka</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Delivery Charge: ৳70
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryZone("Outside Dhaka")}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  deliveryZone === "Outside Dhaka"
                    ? "border-neutral-900 bg-neutral-900 text-white shadow"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div>Outside Dhaka</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Delivery Charge: ৳130
                </div>
              </button>
            </div>
          </div>

          {/* Full Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Full Delivery Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="House, Road, Block, Area, Police Station, District..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Call after 2 PM or deliver to reception"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Live Order Summary Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Total ({items.length} items)</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Charge ({deliveryZone})</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
              <span>Total Payable to Rider</span>
              <span className="text-base text-neutral-950">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Confirm Cash on Delivery Order • {formatCurrency(grandTotal)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
