"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("noir_cookie_consent_v1");
      if (!consent) {
        // Delay slightly for smooth page entry
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("noir_cookie_consent_v1", "accepted");
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/95 backdrop-blur-md border border-neutral-800 text-white shadow-2xl flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Storage & Transparency Notice</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          We use local device storage solely to preserve your active shopping bag
          and selected delivery location. We never deploy invasive third-party
          tracking cookies.
        </p>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-800/80">
          <Link
            href="/privacy-policy"
            className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Review Policy
          </Link>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
