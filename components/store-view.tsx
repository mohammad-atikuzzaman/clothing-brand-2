"use client";

import React, { useState } from "react";
import { ProductType } from "@/lib/catalog-data";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { ProductQuickViewModal } from "@/components/product-quickview-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutModal } from "@/components/checkout-modal";
import { OrderSuccessModal } from "@/components/order-success-modal";
import { Footer } from "@/components/footer";
import { OrderActionResult } from "@/actions/order-actions";
import { Sparkles, SlidersHorizontal } from "lucide-react";

interface StoreViewProps {
  initialProducts: ProductType[];
  dataSource: string;
}

const CATEGORIES = ["All", "Minimalist", "Men", "Women", "Accessories"];

export function StoreView({ initialProducts, dataSource }: StoreViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderActionResult | null>(null);

  // Filter products by selected category
  const filteredProducts = initialProducts.filter((product) => {
    if (activeCategory === "All") return true;
    return product.category === activeCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Sticky Navbar with dynamic cart count */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categories={CATEGORIES}
      />

      <main className="flex-grow">
        {/* Editorial Lookbook Carousel Hero */}
        <Hero onSelectCategory={setActiveCategory} />

        {/* Product Catalog Section */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 pb-4 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
                Curated Heavyweight Drops
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                {activeCategory === "All"
                  ? "Signature Studio Collection"
                  : `${activeCategory} Drop`}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                Showing {filteredProducts.length} pieces
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                Source: {dataSource}
              </span>
            </div>
          </div>

          {/* Quick In-Catalog Filter Pills */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-white text-neutral-600 border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Overlays & Drawers */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(res) => setOrderResult(res)}
      />

      <OrderSuccessModal
        orderResult={orderResult}
        onClose={() => setOrderResult(null)}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
