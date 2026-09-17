"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Check, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { ProductType } from "@/lib/catalog-data";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface QuickViewProps {
  product: ProductType | null;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, onClose }: QuickViewProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  // Initialize selections when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColor(product.colors[0]?.name || "");
      setActiveImageIdx(0);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.discountPrice || product.price,
      size: selectedSize,
      color: selectedColor,
      image: product.images[activeImageIdx] || product.images[0],
      slug: product.slug,
      quantity,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100/80 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Gallery */}
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 bg-neutral-50/50">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-200">
            <Image
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.title}
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? "border-neutral-900 scale-95"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {product.category}
              </span>
              {product.tag && (
                <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {product.tag}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-neutral-900 mt-1 tracking-tight">
              {product.title}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">{product.subtitle}</p>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-black text-neutral-900">
                {formatCurrency(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-neutral-400 line-through font-medium">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Cash on Delivery
              </span>
            </div>

            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Fabric Composition:</span>
                <span className="font-semibold text-neutral-900">
                  {product.fabric}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Care:</span>
                <span className="font-semibold text-neutral-900">
                  Cold Wash Inside Out, Hang Dry
                </span>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2">
                  Color: <span className="font-normal text-neutral-500">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        selectedColor === c.name
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Size: <span className="font-normal text-neutral-500">{selectedSize}</span>
                </label>
                <span className="text-[11px] text-neutral-500 font-medium">
                  Standard Oversized Fit
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedSize === s
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="mt-5 flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Quantity:
              </label>
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-200 transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-200 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Button & Trust Note */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleAdd}
              disabled={isAdded}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" /> Add to Bag •{" "}
                  {formatCurrency(
                    (product.discountPrice || product.price) * quantity
                  )}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pay upon delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-sky-500" /> 2-4 Days Dispatch
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
