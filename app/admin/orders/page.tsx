"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  FileText,
} from "lucide-react";
import {
  getOrdersAction,
  updateOrderStatusAction,
} from "@/actions/order-actions";
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
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchOrders = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await getOrdersAction({ page, limit: 25 });
      if (res.success && res.orders) {
        setOrders(res.orders as AdminOrder[]);
        setSource(res.source || "Active DB");
        if (res.totalPages !== undefined) setTotalPages(res.totalPages);
        if (res.totalCount !== undefined) setTotalCount(res.totalCount);
        if (res.currentPage !== undefined) setCurrentPage(res.currentPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              Dispatch & Logistics
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
              Source: {source}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Call customers to confirm phone/address, prepare parcels, and manage
            cash on delivery riders.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

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

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Pending Phone Verification
          </span>
          <div className="text-2xl font-black text-amber-800 mt-1">
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
            placeholder="Search order #, phone, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            No orders found under this filter.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-neutral-50/60 transition-colors"
              >
                {/* Customer & Address Details */}
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
                        Tap to Call
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

                {/* Ordered Items */}
                <div className="flex-1 min-w-[260px] space-y-1.5 border-t lg:border-t-0 lg:border-l border-neutral-200/60 lg:pl-6 pt-3 lg:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Items to Pack:
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
                    <span>Delivery Charge ({order.customer.city}):</span>
                    <span>{formatCurrency(order.deliveryCharge)}</span>
                  </div>

                  <div className="text-xs font-extrabold text-neutral-950 pt-1 flex justify-between border-t border-neutral-100">
                    <span>Cash To Collect:</span>
                    <span className="text-sm text-emerald-700">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Status Changer Actions */}
                <div className="flex flex-col items-end gap-2 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-neutral-200/60 lg:pl-6 pt-3 lg:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Update Fulfillment Status
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleStatusChange(order._id, "Confirmed")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        order.status === "Confirmed"
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                          : "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200"
                      }`}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, "Shipped")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        order.status === "Shipped"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                      }`}
                    >
                      Ship
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, "Delivered")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        order.status === "Delivered"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      }`}
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, "Cancelled")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        order.status === "Cancelled"
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-neutral-200">
            <span className="text-xs text-neutral-500">
              Showing page <strong className="text-neutral-900">{currentPage}</strong> of{" "}
              <strong className="text-neutral-900">{totalPages}</strong> ({totalCount} total orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || isLoading}
                onClick={() => {
                  const prev = currentPage - 1;
                  setCurrentPage(prev);
                  fetchOrders(prev);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => {
                  const next = currentPage + 1;
                  setCurrentPage(next);
                  fetchOrders(next);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
