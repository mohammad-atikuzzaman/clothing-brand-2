"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  getInquiriesAction,
  updateInquiryStatusAction,
  FormattedInquiry,
} from "@/actions/inquiry-actions";
import { InquiryStatus } from "@/models/ContactInquiry";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<FormattedInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await getInquiriesAction();
      if (res.success && res.inquiries) {
        setInquiries(res.inquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (
    inquiryId: string,
    newStatus: InquiryStatus
  ) => {
    try {
      const res = await updateInquiryStatusAction(inquiryId, newStatus);
      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) =>
            i._id === inquiryId ? { ...i, status: newStatus } : i
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = inquiries.filter((item) => {
    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.orderId &&
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const newCount = inquiries.filter((i) => i.status === "New").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              Customer Relations Desk
            </span>
            {newCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {newCount} New Inquiries
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
            Support & Concierge Inquiries
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tickets submitted through the store contact form. Follow up via phone
            or WhatsApp.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["All", "New", "Responded", "Closed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {st}
              {st === "New" && newCount > 0 && ` (${newCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-3xl border border-neutral-200/80 text-center text-xs text-neutral-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-neutral-400 mb-2" />
            Loading customer tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-neutral-200/80 text-center text-xs text-neutral-500">
            <MessageSquare className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            No inquiries match the current filter.
          </div>
        ) : (
          filtered.map((item) => {
            const cleanPhone = item.phone.replace(/[^0-9]/g, "");
            return (
              <div
                key={item._id}
                className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "New"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : item.status === "Responded"
                          ? "bg-sky-100 text-sky-800 border border-sky-300"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                      }`}
                    >
                      {item.status}
                    </span>
                    <h3 className="font-extrabold text-sm text-neutral-900">
                      {item.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString("en-BD", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1 text-xs">
                    <div className="font-bold text-neutral-900 text-sm">
                      {item.name}
                    </div>
                    <div className="font-mono text-neutral-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <a
                        href={`tel:${item.phone}`}
                        className="hover:text-neutral-900 underline underline-offset-2"
                      >
                        {item.phone}
                      </a>
                    </div>
                    {item.orderId && (
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Related Order: <strong className="text-neutral-900">{item.orderId}</strong>
                      </div>
                    )}

                    {/* Action buttons to communicate */}
                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={`tel:${item.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                          item.name
                        )}%2C%20we%20received%20your%20inquiry%20regarding%20${encodeURIComponent(
                          item.subject
                        )}%20at%20NOIR%20ATELIER.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="md:col-span-8 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-1 font-bold">
                      Customer Message:
                    </span>
                    {item.message}
                  </div>
                </div>

                {/* Status Update Row */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <span className="text-[11px] font-bold text-neutral-400 mr-2">
                    Mark as:
                  </span>
                  <button
                    onClick={() => handleStatusChange(item._id, "New")}
                    disabled={item.status === "New"}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      item.status === "New"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleStatusChange(item._id, "Responded")}
                    disabled={item.status === "Responded"}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      item.status === "Responded"
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-sky-50 text-sky-800 hover:bg-sky-100 border-sky-200"
                    }`}
                  >
                    Responded
                  </button>
                  <button
                    onClick={() => handleStatusChange(item._id, "Closed")}
                    disabled={item.status === "Closed"}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      item.status === "Closed"
                        ? "bg-neutral-800 text-white border-neutral-800"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-200"
                    }`}
                  >
                    Closed / Resolved
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
