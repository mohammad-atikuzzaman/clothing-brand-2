"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { ProductType } from "@/lib/catalog-data";
import {
  createProductAction,
  updateProductAction,
  CreateProductInput,
} from "@/actions/product-actions";
import { uploadProductImageAction } from "@/actions/upload-actions";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductType | null;
  onSuccess: () => void;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [category, setCategory] = useState<
    "Men" | "Women" | "Minimalist" | "Accessories"
  >("Minimalist");
  const [fabric, setFabric] = useState("100% Combed Cotton (240 GSM)");
  const [tag, setTag] = useState("New Arrival");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "XL",
  ]);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: "Obsidian Black", hex: "#1a1a1a" },
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#262626");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setSubtitle(productToEdit.subtitle || "");
      setDescription(productToEdit.description);
      setPrice(productToEdit.price);
      setDiscountPrice(productToEdit.discountPrice || "");
      setCategory(productToEdit.category);
      setFabric(productToEdit.fabric);
      setTag(productToEdit.tag || "");
      setSelectedSizes(productToEdit.sizes || ["M"]);
      setColors(
        productToEdit.colors && productToEdit.colors.length > 0
          ? productToEdit.colors
          : [{ name: "Standard", hex: "#000000" }]
      );
      setImages(productToEdit.images || []);
      setInStock(productToEdit.inStock);
      setFeatured(productToEdit.featured);
    } else {
      // Defaults for new product
      setTitle("");
      setSubtitle("");
      setDescription("");
      setPrice("");
      setDiscountPrice("");
      setCategory("Minimalist");
      setFabric("100% Ring-Spun Organic Cotton (260 GSM)");
      setTag("New Drop");
      setSelectedSizes(["S", "M", "L", "XL"]);
      setColors([{ name: "Washed Noir", hex: "#1c1c1c" }]);
      setImages([
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
      ]);
      setInStock(true);
      setFeatured(false);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors((prev) => [
      ...prev,
      { name: newColorName.trim(), hex: newColorHex },
    ]);
    setNewColorName("");
  };

  const removeColor = (idx: number) => {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadNotice("Uploading to Cloudinary (Server-Side)...");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProductImageAction(formData);
      if (res.success && res.url) {
        setImages((prev) => [...prev, res.url!]);
        setUploadNotice("✓ Image successfully uploaded to Cloudinary!");
        setTimeout(() => setUploadNotice(null), 3500);
      } else {
        setErrorMessage(
          res.message ||
            "Cloudinary upload failed. (Add credentials to .env.local or use image URL below)"
        );
        setUploadNotice(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error uploading image.");
      setUploadNotice(null);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !description.trim() || price === "" || price <= 0) {
      setErrorMessage("Please fill in Title, Description, and a valid Price.");
      return;
    }

    if (images.length === 0) {
      setErrorMessage("Please provide at least one product image URL.");
      return;
    }

    if (selectedSizes.length === 0) {
      setErrorMessage("Please select at least one available size.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateProductInput = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim(),
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : undefined,
        category,
        fabric: fabric.trim(),
        tag: tag.trim() || undefined,
        sizes: selectedSizes,
        colors,
        images,
        inStock,
        featured,
      };

      let res;
      if (productToEdit) {
        res = await updateProductAction(productToEdit.id, payload);
      } else {
        res = await createProductAction(payload);
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.message || "Failed to save product.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error saving product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
          {productToEdit ? "Edit Garment Piece" : "Add New Apparel to Shop"}
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5 mb-6">
          Changes will instantly update your live storefront catalog and Vercel
          Edge caches.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Heavyweight Sculpted Oversized Tee"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                <option value="Minimalist">Minimalist</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Subtitle & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Subtitle (Short Vibe)
              </label>
              <input
                type="text"
                placeholder="e.g. 260 GSM Ultra-Combed Organic Cotton"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Marketing Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Best Seller, Limited Drop"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Regular Price (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="1350"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Sale / Discount Price (৳)
              </label>
              <input
                type="number"
                min={0}
                placeholder="1150 (Optional)"
                value={discountPrice}
                onChange={(e) =>
                  setDiscountPrice(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Fabric Spec / Composition
              </label>
              <input
                type="text"
                placeholder="260 GSM Organic Cotton"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the silhouette, fit, fabric feel, and detailing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>

          {/* Sizes Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedSizes.includes(size)
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Management */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Colors & Swatches
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {colors.map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-100 text-xs font-semibold text-neutral-800 border border-neutral-200"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-neutral-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Color Name (e.g. Raw Ecru)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 flex-1"
              />
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-9 h-8 p-0.5 rounded-lg border border-neutral-300 cursor-pointer"
                title="Pick hex color"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer"
              >
                + Add Color
              </button>
            </div>
          </div>

          {/* Cloudinary Image Upload & Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Product Photography (Cloudinary)
              </label>
              <span className="text-[11px] text-neutral-400">
                Server-Side Secure Upload
              </span>
            </div>

            {/* Cloudinary Upload Dropzone */}
            <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl p-5 text-center transition-colors bg-neutral-50/50 mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="cloudinary-file-input"
              />
              <label
                htmlFor="cloudinary-file-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-neutral-700 animate-spin mb-2" />
                    <span className="text-xs font-bold text-neutral-800">
                      Uploading to Cloudinary...
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Processing WebP/AVIF auto-compression
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-neutral-600 mb-2" />
                    <span className="text-xs font-bold text-neutral-900">
                      Click or Tap to Upload Image to Cloudinary
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">
                      JPG, PNG, WEBP or AVIF up to 8MB (Stored safely on Cloudinary)
                    </span>
                  </>
                )}
              </label>
            </div>

            {uploadNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadNotice}</span>
              </div>
            )}

            {/* Thumbnail previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200"
                  >
                    <Image
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow cursor-pointer"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-neutral-950/80 text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Fallback Image URL input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste external image URL (Unsplash, CDN...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 flex-1 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer"
              >
                + Add URL
              </button>
            </div>
          </div>

          {/* In-Stock & Featured switches */}
          <div className="flex items-center gap-6 pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900"
              />
              <span>In Stock (Available for Customers)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900"
              />
              <span>Featured Highlight</span>
            </label>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Catalog...</span>
                </>
              ) : (
                <span>{productToEdit ? "Update Piece" : "Publish to Shop"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
