"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Database,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  getOrdersAction,
  updateOrderStatusAction,
} from "@/actions/order-actions";
import { seedInitialProductsAction } from "@/actions/product-actions";
import { OrderStatus } from "@/models/Order";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  productId: string;
  title: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  image: string;
}

interface AdminOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: "Inside Dhaka" | "Outside Dhaka";
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string | Date;
}

export default function AdminOrdersPage() {
  const [secretKey, setSecretKey] = useState("admin12345");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const fetchOrders = async (keyToUse: string) => {
    setIsLoading(true);
    try {
      const res = await getOrdersAction(keyToUse);
      if (res.success && res.orders) {
        setOrders(res.orders as AdminOrder[]);
        setSource(res.source || "");
        setIsAuthenticated(true);
      } else {
        alert(res.message || "Invalid Admin Key");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto login with default key in development
    fetchOrders(secretKey);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await updateOrderStatusAction(orderId, newStatus, secretKey);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleSeedProducts = async () => {
    setSeedMessage("Seeding catalog into MongoDB...");
    try {
      const res = await seedInitialProductsAction(secretKey);
      setSeedMessage(res.message || (res.success ? "Success" : "Failed"));
      setTimeout(() => setSeedMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setSeedMessage("Failed to seed products.");
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      filterStatus === "All" || o.status === filterStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter(
    (o) => o.status === "Pending Verification"
  ).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Staff Only Access
            </span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900">
            Admin Order Portal
          </h2>
          <p className="text-xs text-neutral-500 mt-1 mb-6">
            Enter the ADMIN_SECRET_KEY defined in your environment variables.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders(secretKey);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Admin Secret Key
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter admin secret key"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Login to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                  Brand Orders & Dispatch
                </h1>
                <p className="text-xs text-neutral-500">
                  Data source:{" "}
                  <span className="font-semibold text-neutral-800">
                    {source || "Connected"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(secretKey)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSeedProducts}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
              title="Push sample products into your MongoDB database"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Seed MongoDB Products</span>
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
            {seedMessage}
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Total Recorded Orders
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-1">
              {orders.length}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Pending Phone Verification
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {pendingCount}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Gross COD Order Value
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              "All",
              "Pending Verification",
              "Confirmed",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  filterStatus === st
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, phone, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-neutral-700">
                No orders match your filter
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Place a test order on the main store page to see it appear here
                instantly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 overflow-x-auto">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-neutral-50/60 transition-colors"
                >
                  {/* Left: Customer & Delivery Info */}
                  <div className="space-y-2 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-neutral-900">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        {order.customer.name}
                      </p>
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.customer.phone}</span>
                        <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Call to Confirm
                        </span>
                      </a>
                    </div>

                    <p className="text-xs text-neutral-600 max-w-sm">
                      <span className="font-semibold text-neutral-800">
                        {order.customer.city}:
                      </span>{" "}
                      {order.customer.address}
                    </p>

                    {order.customer.notes && (
                      <p className="text-[11px] italic text-neutral-500">
                        Note: &ldquo;{order.customer.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Middle: Ordered Items summary */}
                  <div className="flex-1 min-w-[260px] space-y-1.5 border-t lg:border-t-0 lg:border-l border-neutral-200/60 lg:pl-6 pt-3 lg:pt-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Ordered Items:
                    </span>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-neutral-700 flex items-center justify-between gap-4"
                      >
                        <span>
                          <strong className="text-neutral-900">
                            {item.quantity}x
                          </strong>{" "}
                          {item.title} ({item.size}
                          {item.color ? ` / ${item.color}` : ""})
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="text-[11px] text-neutral-500 pt-1 flex justify-between">
                      <span>Delivery ({order.customer.city}):</span>
                      <span>{formatCurrency(order.deliveryCharge)}</span>
                    </div>

                    <div className="text-xs font-extrabold text-neutral-950 pt-1 flex justify-between border-t border-neutral-100">
                      <span>Cash To Collect:</span>
                      <span className="text-sm text-emerald-700">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Status Change Actions */}
                  <div className="flex flex-col items-end gap-2 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-neutral-200/60 lg:pl-6 pt-3 lg:pt-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Update Order Status
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Confirmed")
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Shipped")
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                      >
                        Ship
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Delivered")
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Cancelled")
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
