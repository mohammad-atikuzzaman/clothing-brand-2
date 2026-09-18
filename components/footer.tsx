"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { StoreSettingsType, DEFAULT_STORE_SETTINGS } from "@/lib/settings-types";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface FooterProps {
  settings?: StoreSettingsType;
}

export function Footer({ settings = DEFAULT_STORE_SETTINGS }: FooterProps) {
  return (
    <footer className="mt-24 border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      {/* Policy highlights bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-neutral-900 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="p-2.5 rounded-xl bg-neutral-800 text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Cash on Delivery (COD)</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Pay in cash only upon physical parcel receipt. Zero advance fees.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="p-2.5 rounded-xl bg-neutral-800 text-sky-400 shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">3-Day Size Replacement</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Need a different size or fit? Easy door-to-door exchange across BD.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="p-2.5 rounded-xl bg-neutral-800 text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">240+ GSM Organic Knit</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Heavyweight ring-spun combed cotton tailored for lifetime drape.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-column Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-neutral-900">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white text-neutral-950 font-black text-lg flex items-center justify-center">
              N
            </span>
            <span className="font-extrabold text-white tracking-tight text-lg">
              NOIR<span className="text-neutral-500 font-light">ATELIER</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
            Studio clothing & architectural basics. Designed in Dhaka for the contemporary global lifestyle. Built without compromises on heavyweight cotton density.
          </p>

          {/* Social Channels */}
          <div className="pt-1 flex items-center gap-3">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-800"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-800"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-800"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="pt-2 space-y-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                Concierge Hotline:{" "}
                <a
                  href={`tel:${settings.phone}`}
                  className="text-neutral-200 font-mono font-bold hover:underline"
                >
                  {settings.phone}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                Studio Desk:{" "}
                <a
                  href={`mailto:${settings.email}`}
                  className="text-neutral-200 font-medium hover:underline"
                >
                  {settings.email}
                </a>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          </div>
        </div>

        {/* Drops / Collections */}
        <div>
          <h5 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
            Collections
          </h5>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li>
              <Link href="/?category=Minimalist#catalog" className="hover:text-white transition-colors">
                Minimalist Drop
              </Link>
            </li>
            <li>
              <Link href="/?category=Men#catalog" className="hover:text-white transition-colors">
                Men&apos;s Studio Essentials
              </Link>
            </li>
            <li>
              <Link href="/?category=Women#catalog" className="hover:text-white transition-colors">
                Women&apos;s Draped Poplin
              </Link>
            </li>
            <li>
              <Link href="/?category=Accessories#catalog" className="hover:text-white transition-colors">
                Canvas & Accessories
              </Link>
            </li>
            <li>
              <Link href="/#catalog" className="hover:text-white transition-colors inline-flex items-center gap-1 text-neutral-300">
                <span>View Full Catalog</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Studio & Company */}
        <div>
          <h5 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
            The Atelier
          </h5>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About Our Craft
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact & Support Desk
              </Link>
            </li>
            <li>
              <Link href="/contact#faq" className="hover:text-white transition-colors">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <span className="text-neutral-500 text-[11px]">
                Dhaka Flagship (Coming Q4)
              </span>
            </li>
          </ul>
        </div>

        {/* Trust & Legal */}
        <div>
          <h5 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
            Customer Care
          </h5>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy#cod" className="hover:text-white transition-colors">
                Cash on Delivery Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy#exchange" className="hover:text-white transition-colors">
                Exchange & Return Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Track / Confirm Order
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-wider">
            NOIR ATELIER
          </span>
          <span>© {new Date().getFullYear()} All Rights Reserved. Built for Bangladesh.</span>
        </div>

        <div className="flex items-center gap-6">
          <span>Nationwide Cash on Delivery</span>
          <span className="text-neutral-700">•</span>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <span className="text-neutral-700">•</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
