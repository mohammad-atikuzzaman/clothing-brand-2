import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ShieldCheck, Lock, Truck, FileText, Phone, Mail, CheckCircle2 } from "lucide-react";
import { getStoreSettingsAction } from "@/actions/settings-actions";

export const metadata: Metadata = {
  title: "Privacy Policy & COD Terms | NOIR ATELIER",
  description:
    "Review our transparent customer privacy terms, Cash on Delivery fulfillment policies, and data security standards at NOIR ATELIER Bangladesh.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getStoreSettingsAction();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar settings={settings} />
      <CartDrawer />

      <main className="flex-grow">
        {/* Editorial Top Banner */}
        <section className="bg-neutral-950 text-white py-16 sm:py-20 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Legal & Customer Trust
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Privacy Policy & COD Terms
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Last Updated: September 2026. Designed with complete transparency for our valued clients across Bangladesh.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm space-y-12 text-sm text-neutral-700 leading-relaxed">
            {/* Quick Summary Box */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-800" />
                Plain-English Summary of Your Privacy
              </h2>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Financial Risk:</strong> We do not store or process credit/debit card numbers. All fulfillment is 100% Cash on Delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Third-Party Data Selling:</strong> We never sell, lease, or rent your mobile numbers or addresses to telemarketers or advertisers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Logistics Disclosure Only:</strong> Only your name, shipping address, and phone number are shared with our licensed courier partner solely to deliver your physical parcel.</span>
                </li>
              </ul>
            </div>

            {/* 1. Information Collected */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">1</span>
                Information We Collect
              </h3>
              <p>
                When you initiate an order on <strong>NOIR ATELIER</strong>, we collect only the necessary operational details needed to process and hand-deliver your garments:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600 text-xs">
                <li><strong>Recipient Full Name:</strong> To address the parcel correctly.</li>
                <li><strong>Contact Phone Number:</strong> To confirm order authenticity, answer sizing questions, and coordinate delivery with the rider.</li>
                <li><strong>Physical Delivery Address & City/District:</strong> To route the parcel through the regional courier hub.</li>
                <li><strong>Optional Order Notes:</strong> Specific apartment instructions or size inquiries provided by you.</li>
                <li><strong>Technical Telemetry:</strong> Anonymized IP addresses and browser headers stored temporarily for rate limiting and preventing fraudulent automated bot orders.</li>
              </ul>
            </div>

            {/* 2. How Data is Used */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">2</span>
                Purpose of Data Usage
              </h3>
              <p>
                We use the information we collect strictly for the following legitimate business purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600 text-xs">
                <li>Dispatching and tracking your Cash on Delivery package.</li>
                <li>Contacting you via voice call or SMS to confirm dispatch before handing parcels to riders.</li>
                <li>Facilitating the 3-day size replacement exchange process if requested.</li>
                <li>Protecting our servers and local database from brute-force bot spam or Denial of Service attacks.</li>
              </ul>
            </div>

            {/* 3. Cash on Delivery Terms */}
            <div id="cod" className="space-y-3 scroll-mt-20">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">3</span>
                Cash on Delivery (COD) Fulfillment Terms
              </h3>
              <p>
                To provide the safest online shopping experience in Bangladesh, NOIR ATELIER adopts a customer-first COD policy:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1">
                  <h4 className="font-bold text-neutral-900">Inside Dhaka Metro</h4>
                  <p className="text-neutral-500">Standard Delivery Charge: <strong>৳{settings.deliveryInsideDhaka}</strong>. Lead time: <strong>24 - 48 Hours</strong>.</p>
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1">
                  <h4 className="font-bold text-neutral-900">Outside Dhaka (All 64 Districts)</h4>
                  <p className="text-neutral-500">Standard Delivery Charge: <strong>৳{settings.deliveryOutsideDhaka}</strong>. Lead time: <strong>48 - 72 Hours</strong>.</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 pt-2">
                <strong>Free Shipping Policy:</strong> All shopping bags totaling <strong>৳{settings.freeShippingThreshold.toLocaleString()} or above</strong> automatically qualify for Free Nationwide Delivery with zero delivery fees applied.
              </p>
            </div>

            {/* 4. Exchange & Returns */}
            <div id="exchange" className="space-y-3 scroll-mt-20">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">4</span>
                3-Day Doorstep Size Replacement Policy
              </h3>
              <p>
                We understand that fit and silhouette are personal. If you receive an item and feel a different size or cut would look better:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600 text-xs">
                <li>Notify us via hotline (<strong>{settings.phone}</strong>) or WhatsApp within <strong>3 days</strong> of receiving your parcel.</li>
                <li>Garments must remain unworn, unwashed, and in their original studio packaging with brand tags attached.</li>
                <li>We will arrange a rider replacement at your doorstep for a seamless swap.</li>
              </ul>
            </div>

            {/* 5. Data Security & Storage */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-mono">5</span>
                Data Security & Server Safeguards
              </h3>
              <p>
                Our web platform utilizes industry-standard security measures including server-side encryption, encrypted cookies, Next.js Server Actions with zero public REST endpoints, and IP-level throttling to prevent unauthorized intrusions or database compromises.
              </p>
            </div>

            {/* 6. Contact Office */}
            <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-3">
              <h3 className="text-base font-bold text-white">
                Questions or Data Removal Requests?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                If you wish to update your records, request complete deletion of past order contacts, or have inquiries regarding our policies, reach our compliance team directly:
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <strong>{settings.email}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <strong>{settings.phone}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
