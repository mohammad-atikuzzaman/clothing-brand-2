"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Truck,
  RotateCcw,
  Lock,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { StoreSettingsType, DEFAULT_STORE_SETTINGS } from "@/lib/settings-types";

interface NavbarProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  categories?: string[];
  settings?: StoreSettingsType;
}

const DEFAULT_CATEGORIES = ["All", "Minimalist", "Men", "Women", "Accessories"];

export function Navbar({
  activeCategory = "All",
  onSelectCategory,
  categories = DEFAULT_CATEGORIES,
  settings = DEFAULT_STORE_SETTINGS,
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    setMobileMenuOpen(false);
    const catalogEl = document.getElementById("catalog");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/?category=${encodeURIComponent(cat)}#catalog`;
    }
  };

  // Secret shortcut: Ctrl + Shift + A / Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        window.location.href = "/admin";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Secret Logo Multi-Click Trigger (4 clicks within 2s)
  const [logoClicks, setLogoClicks] = useState(0);
  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 4) {
        window.location.href = "/admin";
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoClicks(0), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/85 backdrop-blur-md transition-all">
        {/* Micro-announcement banner */}
        <div className="bg-neutral-900 text-neutral-200 text-xs font-medium py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {settings.announcement}
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between">
          {/* Mobile Hamburger Button (visible only on mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 -ml-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo with secret multi-click trigger */}
          <div className="flex items-center gap-3">
            <Link href="/" onClick={handleLogoClick} className="group flex items-center gap-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-black text-base sm:text-lg tracking-tighter group-hover:scale-105 transition-transform">
                N
              </span>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-neutral-900 leading-tight">
                  NOIR<span className="text-neutral-400 font-light">ATELIER</span>
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-500 font-semibold">
                  Studio Clothing
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-full border border-neutral-200/60">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-neutral-600 border-l border-neutral-200 pl-4">
              <Link
                href="/about"
                className="hover:text-neutral-900 transition-colors py-1"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-neutral-900 transition-colors py-1"
              >
                Contact
              </Link>
              <Link
                href="/track-order"
                className="hover:text-neutral-900 transition-colors py-1"
              >
                Track Order
              </Link>
            </div>
          </div>

          {/* Action Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open Cart"
              className="relative p-2 sm:p-2.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer group"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold pr-0.5 hidden xs:inline">Bag</span>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] sm:text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 left-0 max-w-[320px] w-full bg-white shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-black text-sm">
                    N
                  </span>
                  <span className="font-extrabold text-neutral-900 tracking-tight text-base">
                    NOIR ATELIER
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Links */}
              <div className="mt-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-3">
                  Collections & Drops
                </span>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold tracking-tight transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <span>{cat}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Studio & Pages Navigation */}
              <div className="mt-6 pt-5 border-t border-neutral-100">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-3">
                  Studio & Concierge
                </span>
                <div className="space-y-1">
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                  >
                    <span>About Atelier</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                  >
                    <span>Contact & FAQs</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                  >
                    <span>Track Order Status</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                  <Link
                    href="/privacy-policy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
                  >
                    <span>Privacy & COD Terms</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                </div>
              </div>

              {/* Brand Guarantees */}
              <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cash on Delivery (No Advance)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>3-Day Hassle-Free Size Exchange</span>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Support Info */}
            <div className="pt-6 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
              <p className="font-bold text-neutral-800">Direct Concierge Hotline:</p>
              <a
                href={`tel:${settings.phone}`}
                className="font-mono text-neutral-900 font-bold block hover:underline"
              >
                {settings.phone}
              </a>
              <p className="text-[10px] text-neutral-400">{settings.supportHours}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
