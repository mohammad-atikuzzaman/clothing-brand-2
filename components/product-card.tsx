"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Check, Eye } from "lucide-react";
import { ProductType } from "@/lib/catalog-data";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { trackAddToCart } from "@/lib/meta-pixel";

interface ProductCardProps {
  product: ProductType;
  onQuickView: (product: ProductType) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] || "M"
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || ""
  );
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const activePrice = product.discountPrice || product.price;

    addItem({
      productId: product.id,
      title: product.title,
      price: activePrice,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0],
      slug: product.slug,
      quantity: 1,
    });

    // Fire Meta Pixel AddToCart
    trackAddToCart({
      id: product.id,
      title: product.title,
      category: product.category,
      price: activePrice,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Tag */}
        {product.tag && (
          <div className="absolute top-3 left-3 z-10 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
            {product.tag}
          </div>
        )}

        {/* Fabric GSM pill */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md text-neutral-800 text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm border border-neutral-200/60">
          {product.fabric.split("(")[1]?.replace(")", "") || "100% Combed Cotton"}
        </div>

        {/* Hover Quick View Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-md text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-neutral-900 hover:text-white shadow"
          title="Quick View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              {product.category}
            </span>
            {product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(c.name);
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-3 h-3 rounded-full border ${
                      selectedColor === c.name
                        ? "ring-1 ring-offset-1 ring-neutral-800"
                        : "border-neutral-300"
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          <h3 className="mt-1 text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-neutral-700 transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
            {product.subtitle}
          </p>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-neutral-900">
              {formatCurrency(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Size pills & Quick Add Button */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          {/* Sizes */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                  selectedSize === size
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Add to cart"
            className={`shrink-0 flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer shadow-sm ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            {isAdded ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
