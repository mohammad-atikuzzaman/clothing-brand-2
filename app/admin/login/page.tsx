"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { loginAdminAction } from "@/actions/auth-actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginAdminAction({ email, password });
      if (res.success) {
        router.push("/admin");
      } else {
        setErrorMessage(res.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white selection:bg-white selection:text-neutral-950">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 opacity-80" />

      <div className="relative z-10 w-full max-w-md bg-neutral-900/90 backdrop-blur-xl rounded-3xl border border-neutral-800 p-8 sm:p-10 shadow-2xl">
        {/* Brand Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-black text-base">
              N
            </span>
            <span className="font-extrabold text-lg tracking-tight text-white">
              NOIR ATELIER
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure Auth
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">
          Executive Portal
        </h1>
        <p className="text-xs text-neutral-400 mt-1 mb-6">
          Sign in with your verified administrator credentials to access
          inventory, fulfillment, and business analytics.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@noiratelier.com"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Management</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
