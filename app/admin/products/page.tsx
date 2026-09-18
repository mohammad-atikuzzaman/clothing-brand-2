"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  getAllProductsAdminAction,
  toggleProductStockAction,
  deleteProductAction,
} from "@/actions/product-actions";
import { ProductType } from "@/lib/catalog-data";
import { formatCurrency } from "@/lib/utils";
import { ProductFormModal } from "@/components/admin/product-form-modal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState<"All" | "InStock" | "OutOfStock">(
    "All"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [dbSource, setDbSource] = useState("");

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getAllProductsAdminAction();
      if (res.products) {
        setProducts(res.products);
        setDbSource(res.source);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStock = async (id: string) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
    await toggleProductStockAction(id);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}" from the catalog?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      await deleteProductAction(id);
    }
  };

  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;

    const matchesStock =
      stockFilter === "All" ||
      (stockFilter === "InStock" && p.inStock) ||
      (stockFilter === "OutOfStock" && !p.inStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              Shop Management
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
              Source: {dbSource || "Connected"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-0.5">
            Apparel & Inventory Catalog
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Add new garments, update prices, and control stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Piece</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Catalog Pieces
            </span>
            <div className="text-2xl font-black text-neutral-900 mt-0.5">
              {products.length}
            </div>
          </div>
          <Package className="w-8 h-8 text-neutral-300" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Active In Stock
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {inStockCount}
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-300" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Out of Stock / Inactive
            </span>
            <div className="text-2xl font-black text-rose-700 mt-0.5">
              {outOfStockCount}
            </div>
          </div>
          <XCircle className="w-8 h-8 text-rose-300" />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {["All", "Minimalist", "Men", "Women", "Accessories"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                categoryFilter === cat
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white"
          >
            <option value="All">All Stock Status</option>
            <option value="InStock">In Stock Only</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            No products match your search or filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
              >
                {/* Product Thumbnail & Info */}
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div className="relative w-14 h-18 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    <Image
                      src={p.images[0] || ""}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {p.category}
                      </span>
                      {p.tag && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 text-white">
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      {p.fabric}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-left sm:text-right min-w-[120px]">
                  <div className="text-sm font-black text-neutral-900">
                    {formatCurrency(p.discountPrice || p.price)}
                  </div>
                  {p.discountPrice && (
                    <div className="text-[11px] text-neutral-400 line-through">
                      {formatCurrency(p.price)}
                    </div>
                  )}
                </div>

                {/* Stock Toggle Switch */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <button
                    onClick={() => handleToggleStock(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      p.inStock
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.inStock ? "bg-emerald-600 animate-pulse" : "bg-neutral-500"
                      }`}
                    />
                    <span>{p.inStock ? "In Stock" : "Sold Out"}</span>
                  </button>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        onSuccess={() => loadProducts()}
      />
    </div>
  );
}
