import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Feather,
  Layers,
  Award,
} from "lucide-react";

import { getStoreSettingsAction } from "@/actions/settings-actions";

export const metadata: Metadata = {
  title: "About Our Craft | NOIR ATELIER Studio",
  description:
    "Learn about NOIR ATELIER's commitment to architectural basics, 240+ GSM combed organic cotton, and contemporary apparel made in Dhaka, Bangladesh.",
};

export default async function AboutPage() {
  const settings = await getStoreSettingsAction();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar settings={settings} />
      <CartDrawer />

      <main className="flex-grow">
        {/* Editorial Hero Header */}
        <section className="relative bg-neutral-950 text-white py-16 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono uppercase tracking-widest mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Philosophy & Craftsmanship
            </div>
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Architectural Basics.<br />
              <span className="text-neutral-400 font-light">Zero Synthetic Fillers.</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Founded in Dhaka to challenge fast fashion mediocrity. We engineer heavyweight 240+ GSM organic cotton garments sculpted with permanent drape, built for lifetime durability.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/#catalog"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-neutral-950 font-bold text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Explore Studio Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-neutral-900 text-neutral-200 border border-neutral-700 font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center"
              >
                Visit Studio Desk
              </Link>
            </div>
          </div>
        </section>

        {/* Narrative & Craft Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2">
                The Problem With Fast Fashion
              </span>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight leading-snug">
                Why do ordinary tees shrink, twist, and lose shape after two washes?
              </h2>
              <div className="space-y-4 text-sm text-neutral-600 mt-6 leading-relaxed">
                <p>
                  Most commercial retail brands use 140-160 GSM carded cotton mixed with polyester to cut manufacturing expenses. The result? Garments that pill, lose their boxy shape, and become see-through in sunlight.
                </p>
                <p>
                  At <strong>NOIR ATELIER</strong>, we reject that compromise entirely. We spin strictly <strong>100% combed long-staple organic cotton</strong> knitted at ultra-dense gauges starting from 240 GSM up to 340 GSM French Terry.
                </p>
                <p>
                  Every piece is sanforized and garment-washed before packing, ensuring <strong>zero unexpected post-wash shrinkage</strong>.
                </p>
              </div>
            </div>

            {/* Spec Matrix Card */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-4">
                Atelier Standard vs Ordinary Retail
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-700">Knit Fabric Density</span>
                  <span className="font-mono text-neutral-900 font-bold bg-neutral-100 px-2 py-1 rounded">240 - 320+ GSM Heavyweight</span>
                </div>
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-700">Yarn Quality</span>
                  <span className="font-mono text-neutral-900 font-bold bg-neutral-100 px-2 py-1 rounded">100% Combed Ring-Spun</span>
                </div>
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-700">Neck Collar Rib</span>
                  <span className="font-mono text-neutral-900 font-bold bg-neutral-100 px-2 py-1 rounded">1x1 Lycra Elastic Stay-Flat</span>
                </div>
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-700">Post-Wash Shrinkage</span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">&lt; 1.5% (Pre-Sanforized)</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-semibold text-neutral-700">Payment Trust</span>
                  <span className="font-mono text-neutral-900 font-bold bg-neutral-100 px-2 py-1 rounded">100% Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section className="bg-neutral-100/70 border-y border-neutral-200/80 py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 block mb-2">
                Our Foundation
              </span>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                The 4 Architectural Pillars
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">1. Density First</h4>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  We refuse thin lightweight knits. Every yard is knitted with heavy compact gauge for sculpted, structural silhouette.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                  <Feather className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">2. Natural Breathability</h4>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Pure cotton fibers allow optimal moisture wicking in Bangladesh&apos;s tropical climate without trapping heat.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">3. Honest COD</h4>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  No advance payment or risky gateways. You verify parcel quality before paying our delivery rider in cash.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">4. Small Batch Drops</h4>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Produced in curated micro-batches to maintain zero warehouse waste and unmatched stitch consistency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ethical Production Callout */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-neutral-900 text-white p-10 sm:p-14 rounded-3xl relative overflow-hidden">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to feel the difference in hand?
            </h3>
            <p className="mt-3 text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Order your first piece with nationwide Cash on Delivery. If the fit isn&apos;t flawless, our 3-day exchange policy has you covered.
            </p>
            <div className="mt-8">
              <Link
                href="/#catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-neutral-950 font-bold text-sm hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
              >
                <span>Browse The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
