"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      {/* Policy highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-neutral-800 text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Pay in cash only when you hold your garments in hand. Zero risk,
              zero advance fees.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-neutral-800 text-sky-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Hassle-Free Size Exchange</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Didn&apos;t fit your aesthetic? Exchange any unworn piece within 3
              days with rider replacement.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-neutral-800 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Ethical Craftsmanship</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              240+ GSM ring-spun combed organic cotton knit, tailored for lifetime
              durability.
            </p>
          </div>
        </div>
      </div>

      {/* Main footer info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-wider">
            NOIR ATELIER
          </span>
          <span>© {new Date().getFullYear()} All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
          <span className="text-neutral-700">•</span>
          <span>Designed for High Traffic & Vercel Free Tier</span>
        </div>
      </div>
    </footer>
  );
}
