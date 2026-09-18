"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sliders,
  MessageSquare,
} from "lucide-react";
import { getCurrentAdminAction, logoutAdminAction } from "@/actions/auth-actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on login page, render clean standalone view
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      getCurrentAdminAction().then((session) => {
        if (!session) {
          router.push("/admin/login");
        } else {
          setAdminUser(session);
        }
      });
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Products & Inventory",
      href: "/admin/products",
      icon: Package,
      active: pathname.startsWith("/admin/products"),
    },
    {
      label: "Orders & Dispatch",
      href: "/admin/orders",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin/orders"),
    },
    {
      label: "Customer Inquiries",
      href: "/admin/inquiries",
      icon: MessageSquare,
      active: pathname.startsWith("/admin/inquiries"),
    },
    {
      label: "Store Settings & Contacts",
      href: "/admin/settings",
      icon: Sliders,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900">
      {/* Mobile Top bar */}
      <div className="md:hidden bg-neutral-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-white text-neutral-950 flex items-center justify-center font-black text-sm">
            N
          </span>
          <span className="font-extrabold text-sm tracking-tight">
            NOIR ATELIER // BIZ
          </span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-neutral-950 text-neutral-300 flex-shrink-0 flex flex-col justify-between p-6 z-20 ${
          mobileNavOpen ? "block" : "hidden md:flex"
        }`}
      >
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="hidden md:flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-black text-base">
              N
            </span>
            <div>
              <h2 className="font-black text-white text-base tracking-tight leading-tight">
                NOIR ATELIER
              </h2>
              <p className="text-[10px] uppercase font-mono text-neutral-400">
                Business & Operations
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    item.active
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-6 border-t border-neutral-900 space-y-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded">
              View
            </span>
          </Link>

          {adminUser && (
            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white truncate">
                  {adminUser.name}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">
                {adminUser.email}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
