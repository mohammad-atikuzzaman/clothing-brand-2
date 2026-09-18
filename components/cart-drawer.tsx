"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";

interface CartDrawerProps {
  onOpenCheckout?: () => void;
}

export function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const setIsOpen = useCartStore((s) => s.setIsOpen);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const deliveryZone = useCartStore((s) => s.deliveryZone);
  const setDeliveryZone = useCartStore((s) => s.setDeliveryZone);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryCharge = useCartStore((s) => s.deliveryCharge());
  const grandTotal = useCartStore((s) => s.grandTotal());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-extrabold text-neutral-900">
                Your Shopping Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Cart Items or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Your bag is empty
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Discover our heavyweight essentials and signature streetwear
                  drops.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="py-4 flex gap-4 items-center"
                >
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Size: <span className="font-semibold text-neutral-700">{item.size}</span>
                      {item.color && (
                        <>
                          {" "}• Color: <span className="font-semibold text-neutral-700">{item.color}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs font-extrabold text-neutral-900 mt-1">
                      {formatCurrency(item.price * item.quantity)}
                    </p>

                    {/* Quantity Stepper */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1,
                              item.color
                            )
                          }
                          className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-[11px] font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1,
                              item.color
                            )
                          }
                          className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Order Summary & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200/80 bg-neutral-50/70 space-y-4">
              {/* Delivery Zone selection */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                  Delivery Destination:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryZone("Inside Dhaka")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      deliveryZone === "Inside Dhaka"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <div>Inside Dhaka</div>
                    <div className="text-[10px] opacity-80">৳70 (24-48 Hours)</div>
                  </button>

                  <button
                    onClick={() => setDeliveryZone("Outside Dhaka")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      deliveryZone === "Outside Dhaka"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <div>Outside Dhaka</div>
                    <div className="text-[10px] opacity-80">৳130 (2-4 Days)</div>
                  </button>
                </div>
              </div>

              {/* Price calculation */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge ({deliveryZone})</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total (Pay on Delivery)</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenCheckout) {
                    onOpenCheckout();
                  } else {
                    window.location.href = "/?checkout=open#catalog";
                  }
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Order with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero advance payment needed. Pay courier on arrival.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
