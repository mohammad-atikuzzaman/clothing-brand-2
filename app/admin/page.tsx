"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Phone,
  ArrowRight,
  Package,
  Plus,
  RefreshCw,
  Database,
  Truck,
  AlertTriangle,
} from "lucide-react";
import {
  getBusinessDashboardMetricsAction,
  updateOrderStatusAction,
} from "@/actions/order-actions";
import { seedInitialProductsAction } from "@/actions/product-actions";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/models/Order";
import { ProductFormModal } from "@/components/admin/product-form-modal";

interface DashboardMetrics {
  totalOrders: number;
  grossRevenue: number;
  netRealizedRevenue: number;
  averageOrderValue: number;
  pendingVerificationCount: number;
  deliveredCount: number;
  confirmedCount: number;
  cancelledCount: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await getBusinessDashboardMetricsAction();
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
        setRecentOrders(res.recentOrders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await updateOrderStatusAction(orderId, status);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedMongoDB = async () => {
    setSeedNotice("Seeding initial apparel catalog to MongoDB Atlas...");
    try {
      const res = await seedInitialProductsAction();
      setSeedNotice(res.message || "Done.");
      setTimeout(() => setSeedNotice(null), 5000);
      fetchDashboardData();
    } catch (e) {
      console.error(e);
      setSeedNotice("Failed to seed.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
            Executive Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
            Business & Store Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time cash flow, inventory movement, and customer order pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {seedNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
          {seedNotice}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Order Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Gross Order Value
            </span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-neutral-950">
              {formatCurrency(metrics?.grossRevenue || 0)}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Active recorded COD orders
            </p>
          </div>
        </div>

        {/* Realized Delivered Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Realized Cash (Delivered)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-700">
              {formatCurrency(metrics?.netRealizedRevenue || 0)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {metrics?.deliveredCount || 0} orders delivered & collected
            </p>
          </div>
        </div>

        {/* Pending Phone Calls Alert */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Verification
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-800">
              {metrics?.pendingVerificationCount || 0}
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3" /> Call customer to confirm dispatch
            </p>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Total Orders & AOV
            </span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-neutral-900">
              {metrics?.totalOrders || 0}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 font-medium">
              Average Order: {formatCurrency(metrics?.averageOrderValue || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Operational Highlights & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations panel */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
            Quick Actions
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-neutral-900" />
                Add New Garment Piece
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition-all"
            >
              <span className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                Fulfill Pending Deliveries
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                {metrics?.pendingVerificationCount || 0} Pending
              </span>
            </Link>

            <button
              onClick={handleSeedMongoDB}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-sky-600" />
                Sync / Seed MongoDB Atlas
              </span>
              <span className="text-[10px] text-neutral-400">Run</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
              Pro Business Tip
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed">
              COD return rates drop by <strong>85%</strong> when you call customers
              within 30 minutes of placing their order to verify their phone and
              delivery address.
            </p>
          </div>
        </div>

        {/* Live Order Pipeline Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                  Recent Orders Stream
                </h3>
                <p className="text-xs text-neutral-400">
                  Latest customer orders requiring attention
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                No orders recorded yet. Place a test order on the storefront!
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === "Pending Verification"
                              ? "bg-amber-100 text-amber-800"
                              : order.status === "Confirmed"
                              ? "bg-sky-100 text-sky-800"
                              : order.status === "Shipped"
                              ? "bg-indigo-100 text-indigo-800"
                              : order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 mt-0.5">
                        <span className="font-semibold">
                          {order.customer.name}
                        </span>{" "}
                        • {order.customer.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-neutral-900">
                          {formatCurrency(order.total)}
                        </p>
                        <span className="text-[10px] text-neutral-400">
                          {order.items.length} items
                        </span>
                      </div>

                      <a
                        href={`tel:${order.customer.phone}`}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title={`Call ${order.customer.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Cash on Delivery Dispatch Cycle: 24-48 Hours</span>
            <Link
              href="/admin/orders"
              className="font-bold text-neutral-900 hover:underline"
            >
              Manage Deliveries →
            </Link>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}
