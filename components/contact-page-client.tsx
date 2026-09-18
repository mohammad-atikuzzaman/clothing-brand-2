"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { StoreSettingsType } from "@/lib/settings-types";
import { submitContactInquiryAction } from "@/actions/contact-actions";
import { trackContact } from "@/lib/meta-pixel";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
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

export function ContactPageClient({
  initialSettings,
}: {
  initialSettings: StoreSettingsType;
}) {
  const settings = initialSettings;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    orderId: "",
    subject: "Order Status & Tracking",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [tokenHoneypot, setTokenHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await submitContactInquiryAction({
        ...formData,
        website_field_hp: honeypot,
        form_verify_token_hp: tokenHoneypot,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        setSubmitted(true);
      } else {
        setErrorMessage(res.message || "Failed to submit inquiry.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error occurred while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, "");

  const faqs = [
    {
      q: "How long does Cash on Delivery (COD) shipping take?",
      a: "Inside Dhaka City deliveries take 24 to 48 hours. Outside Dhaka across all 64 districts takes 48 to 72 hours via our courier partners (Pathao & Steadfast).",
    },
    {
      q: "How does the 3-day size exchange policy work?",
      a: `If the size doesn't fit your desired drape, notify our WhatsApp or hotline (${settings.phone}) within 3 days of parcel delivery. Keep original tags intact. We dispatch the replacement size and the rider swaps it at your doorstep.`,
    },
    {
      q: "Can I inspect the parcel in front of the courier rider?",
      a: "Yes! You may inspect the sealed garment packaging before handing over cash to ensure correct items were dispatched.",
    },
    {
      q: "Is there any advance payment or hidden delivery fee?",
      a: `Zero advance fee required. Inside Dhaka delivery is ৳${settings.deliveryInsideDhaka}, and Outside Dhaka is ৳${settings.deliveryOutsideDhaka}. Orders over ৳${settings.freeShippingThreshold.toLocaleString()} qualify for nationwide FREE delivery.`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar settings={settings} />
      <CartDrawer />

      <main className="flex-grow">
        {/* Header Banner */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono uppercase tracking-widest mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Direct Support & Studio Desk
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              We&apos;re here to assist your order.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Have questions regarding garment sizing, ongoing COD delivery status, or custom batch orders? Reach our dedicated Dhaka concierge desk.
            </p>
          </div>
        </section>

        {/* Contact Info + Inquiry Form */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Col: Direct channels */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2">
                  Rapid Assistance
                </span>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                  Direct Concierge Channels
                </h2>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Our Dhaka dispatch team monitors phone lines and WhatsApp daily.
                </p>
              </div>

              {/* Channel Cards */}
              <div className="space-y-4">
                {/* Phone Call Card */}
                <a
                  href={`tel:${settings.phone}`}
                  onClick={() => trackContact("Phone Call")}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-900 transition-all group shadow-sm"
                >
                  <div className="p-3 rounded-xl bg-neutral-900 text-white group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Hotline & Voice Support
                    </h3>
                    <p className="font-mono text-base font-bold text-neutral-900 mt-0.5">
                      {settings.phone}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Tap to call directly from mobile phone
                    </p>
                  </div>
                </a>

                {/* WhatsApp Chat Card */}
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20NOIR%20ATELIER%20Team%2C%20I%20have%20an%20inquiry%20regarding%20an%20order.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackContact("WhatsApp")}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-600 transition-all group shadow-sm"
                >
                  <div className="p-3 rounded-xl bg-emerald-600 text-white group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Official WhatsApp Concierge
                    </h3>
                    <p className="text-sm font-bold text-emerald-950 mt-0.5">
                      Chat with Support Specialist
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Average response time: Under 15 minutes
                    </p>
                  </div>
                </a>

                {/* Email Support */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                  <div className="p-3 rounded-xl bg-neutral-100 text-neutral-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Electronic Mail
                    </h3>
                    <p className="font-mono text-sm font-bold text-neutral-900 mt-0.5">
                      {settings.email}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Wholesale, press inquiries & formal requests
                    </p>
                  </div>
                </div>

                {/* Studio Location & Hours */}
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3 text-xs text-neutral-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900 block">
                        Studio Showroom & Dispatch Hub
                      </span>
                      <span>{settings.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 border-t border-neutral-100">
                    <Clock className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900 block">
                        Operating Hours
                      </span>
                      <span>{settings.supportHours}</span>
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-3 font-bold">
                    Official Social Lookbook
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {settings.facebookUrl && (
                      <a
                        href={settings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-xs font-semibold transition-colors"
                      >
                        <FacebookIcon className="w-3.5 h-3.5" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {settings.instagramUrl && (
                      <a
                        href={settings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-xs font-semibold transition-colors"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {settings.youtubeUrl && (
                      <a
                        href={settings.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-xs font-semibold transition-colors"
                      >
                        <YoutubeIcon className="w-3.5 h-3.5" />
                        <span>YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                    Direct Dispatch Desk
                  </span>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                    Send an Inquiry Ticket
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Fill in your details below and our team will get back to you via phone or SMS.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {submitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-950">
                      Inquiry Ticket Received!
                    </h4>
                    <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                      {successMessage || (
                        <>
                          Thank you, <strong>{formData.name}</strong>. Our concierge representative will contact you at <strong>{formData.phone}</strong> shortly.
                        </>
                      )}
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          phone: "",
                          orderId: "",
                          subject: "Order Status & Tracking",
                          message: "",
                        });
                        setErrorMessage(null);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Honeypot hidden input */}
                    <input
                      type="text"
                      name="website_field_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ display: "none" }}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                    <input
                      type="text"
                      name="form_verify_token_hp"
                      value={tokenHoneypot}
                      onChange={(e) => setTokenHoneypot(e.target.value)}
                      style={{ display: "none" }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1.5">
                          Your Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g. Asif Chowdhury"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-neutral-700 block mb-1.5">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1.5">
                          Inquiry Topic
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 bg-white"
                        >
                          <option>Order Status & Tracking</option>
                          <option>Size Exchange Request</option>
                          <option>Garment Sizing Guidance</option>
                          <option>Bulk / Studio Collaboration</option>
                          <option>Feedback or Other Concern</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-neutral-700 block mb-1.5">
                          Order Number <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.orderId}
                          onChange={(e) =>
                            setFormData({ ...formData, orderId: e.target.value })
                          }
                          placeholder="e.g. ORD-260918-1234"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1.5">
                        Your Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us what you need assistance with..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting Ticket...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Concierge Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-neutral-100/70 border-t border-neutral-200/80 py-20 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2">
                Immediate Clarification
              </span>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                Frequently Answered Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${
                        openFaq === idx ? "rotate-180 text-neutral-900" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
