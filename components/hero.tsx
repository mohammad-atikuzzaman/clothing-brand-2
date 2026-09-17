"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowDownRight, ShieldCheck } from "lucide-react";

interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaText: string;
  image: string;
  categoryFilter?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    tag: "DROP 01 // AUTUMN 2026",
    title: "ARCHITECTURAL",
    highlight: "HEAVYWEIGHTS.",
    subtitle: "260 GSM organic ring-spun cotton with sculpted boxy drape.",
    ctaText: "Shop Heavyweight",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop",
    categoryFilter: "Minimalist",
  },
  {
    id: "slide-2",
    tag: "DROP 02 // TAILORED RELAXATION",
    title: "PURE BELGIAN",
    highlight: "LINEN EDITIONS.",
    subtitle: "Naturally breathable silhouettes engineered for effortless poise.",
    ctaText: "Explore Linen",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    categoryFilter: "Men",
  },
  {
    id: "slide-3",
    tag: "DROP 03 // STUDIO FLEECE",
    title: "DOUBLE-FACED",
    highlight: "FRENCH TERRY.",
    subtitle: "420 GSM seamless drop-shoulder hoodies with zero drawstrings.",
    ctaText: "Discover Outerwear",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
    categoryFilter: "Women",
  },
];

interface HeroProps {
  onSelectCategory?: (category: string) => void;
}

export function Hero({ onSelectCategory }: HeroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const handleCtaClick = (category?: string) => {
    if (category && onSelectCategory) {
      onSelectCategory(category);
    }
    const catalogEl = document.getElementById("catalog");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeSlide = HERO_SLIDES[currentIdx];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[72vh] min-h-[520px] max-h-[760px] bg-neutral-950 text-white overflow-hidden select-none"
    >
      {/* Slide Background Images with smooth fade */}
      {HERO_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIdx ? "opacity-45 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ transitionProperty: "opacity, transform", transitionDuration: "1200ms" }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover object-center filter contrast-110 grayscale-[35%]"
          />
        </div>
      ))}

      {/* Luxury Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/20 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-transparent z-10" />

      {/* Main Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-12 md:py-16">
        {/* Top Micro-Tag */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            {activeSlide.tag}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Cash on Delivery Nationwide
          </span>
        </div>

        {/* Central Editorial Headlines */}
        <div className="max-w-2xl space-y-4 my-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95] text-white">
            {activeSlide.title}
            <span className="block text-neutral-400 font-light italic mt-1">
              {activeSlide.highlight}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 font-normal max-w-lg leading-relaxed">
            {activeSlide.subtitle}
          </p>

          <div className="pt-2">
            <button
              onClick={() => handleCtaClick(activeSlide.categoryFilter)}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-xl cursor-pointer"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Progress Indicator & Navigation Controls */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/10">
          {/* Slide Progress Bars */}
          <div className="flex items-center gap-2.5">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIdx(idx)}
                className="group py-2 cursor-pointer focus:outline-none"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentIdx
                      ? "w-12 sm:w-16 bg-white shadow-sm"
                      : "w-4 sm:w-6 bg-white/25 group-hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
            <span className="text-[11px] font-mono text-neutral-400 ml-2 hidden sm:inline">
              0{currentIdx + 1} / 0{HERO_SLIDES.length}
            </span>
          </div>

          {/* Previous / Next Arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-neutral-950 backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-neutral-950 backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
