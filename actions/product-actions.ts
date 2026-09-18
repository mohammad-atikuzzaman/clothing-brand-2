"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { INITIAL_PRODUCTS, ProductType } from "@/lib/catalog-data";
import { verifyAdminGuard } from "@/lib/auth";

function formatProduct(doc: Record<string, unknown>): ProductType {
  const images =
    Array.isArray(doc.images) && doc.images.length > 0
      ? (doc.images as string[])
      : Array.isArray(doc.galleryImages) && doc.galleryImages.length > 0
      ? (doc.galleryImages as string[])
      : typeof doc.image === "string" && doc.image
      ? [doc.image]
      : [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
        ];

  const categoryStr = String(doc.category || "");
  const category: ProductType["category"] = [
    "Men",
    "Women",
    "Minimalist",
    "Accessories",
  ].includes(categoryStr)
    ? (categoryStr as ProductType["category"])
    : "Minimalist";

  const rawSizes = Array.isArray(doc.sizes) && doc.sizes.length > 0 ? doc.sizes : ["S", "M", "L", "XL"];
  const sizes: string[] = rawSizes.map((s) => String(s));

  const rawColors =
    Array.isArray(doc.colors) && doc.colors.length > 0
      ? (doc.colors as Array<Record<string, unknown>>)
      : [{ name: "Noir", hex: "#171717" }];
  const colors = rawColors.map((c) => ({
    name: String(c.name || "Default"),
    hex: String(c.hex || "#171717"),
  }));

  return {
    id: String(doc._id || doc.id || `prod-${Date.now()}`),
    slug: String(doc.slug || `piece-${Date.now()}`),
    title: String(doc.title || doc.name || "Studio Garment Piece"),
    subtitle: doc.subtitle ? String(doc.subtitle) : "",
    description: String(doc.description || "Studio collection architectural garment."),
    price: Number(doc.price || 1200),
    discountPrice:
      doc.discountPrice !== undefined && doc.discountPrice !== null
        ? Number(doc.discountPrice)
        : undefined,
    category,
    sizes,
    colors,
    images,
    inStock: doc.inStock !== false,
    featured: Boolean(doc.featured),
    tag: doc.tag ? String(doc.tag) : doc.featured ? "Featured" : undefined,
    fabric: String(doc.fabric || "240 GSM Combed Cotton"),
  };
}

export async function getProductsAction(): Promise<{
  products: ProductType[];
  source: "MongoDB" | "Static Catalog";
}> {
  try {
    const db = await connectToDatabase();
    if (db) {
      const dbProducts = await Product.find({ inStock: true })
        .sort({ createdAt: -1 })
        .lean();
      if (dbProducts && dbProducts.length > 0) {
        const formatted: ProductType[] = dbProducts.map((p) =>
          formatProduct(p as unknown as Record<string, unknown>)
        );
        return { products: formatted, source: "MongoDB" };
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not read products from MongoDB, falling back:", err);
  }

  // Fallback to static catalog if DB is empty or during first run
  return {
    products: INITIAL_PRODUCTS.filter((p) => p.inStock),
    source: "Static Catalog",
  };
}

/**
 * Returns all products for Admin management (including out-of-stock items)
 */
export async function getAllProductsAdminAction(): Promise<{
  success: boolean;
  products: ProductType[];
  source: string;
}> {
  await verifyAdminGuard();

  try {
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        products: [],
        source: "Database Offline",
      };
    }

    const dbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
    const formatted: ProductType[] = dbProducts.map((p) =>
      formatProduct(p as unknown as Record<string, unknown>)
    );
    return { success: true, products: formatted, source: "MongoDB Atlas" };
  } catch (err) {
    console.error("❌ getAllProductsAdminAction error:", err);
    return {
      success: false,
      products: [],
      source: "Error",
    };
  }
}

export interface CreateProductInput {
  title: string;
  slug?: string;
  subtitle?: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: "Men" | "Women" | "Minimalist" | "Accessories";
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  inStock?: boolean;
  featured?: boolean;
  tag?: string;
  fabric: string;
}

/**
 * Create a new product in the shop catalog
 */
export async function createProductAction(input: CreateProductInput) {
  await verifyAdminGuard();

  try {
    const slug =
      input.slug?.trim() ||
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Math.floor(100 + Math.random() * 900);

    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message: "Database connection unavailable.",
      };
    }

    const newProduct = await Product.create({
      ...input,
      slug,
      inStock: input.inStock ?? true,
      featured: input.featured ?? false,
    });

    revalidatePath("/");
    revalidatePath("/admin/products");

    return {
      success: true,
      productId: newProduct._id.toString(),
      message: "Product created successfully in MongoDB!",
    };
  } catch (error) {
    console.error("❌ createProductAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

/**
 * Update existing product details
 */
export async function updateProductAction(
  id: string,
  input: Partial<CreateProductInput>
) {
  await verifyAdminGuard();

  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection unavailable." };
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true }
    );
    if (!updated) {
      return { success: false, message: "Product not found." };
    }

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true, message: "Product updated successfully!" };
  } catch (error) {
    console.error("❌ updateProductAction error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

/**
 * Toggle stock status (In Stock <-> Out of Stock)
 */
export async function toggleProductStockAction(id: string) {
  await verifyAdminGuard();

  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection unavailable." };
    }

    const product = await Product.findById(id);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    product.inStock = !product.inStock;
    await product.save();

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("❌ toggleProductStockAction error:", error);
    return { success: false, message: "Failed to toggle stock" };
  }
}

/**
 * Delete product from catalog
 */
export async function deleteProductAction(id: string) {
  await verifyAdminGuard();

  try {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, message: "Database connection unavailable." };
    }

    await Product.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted." };
  } catch (error) {
    console.error("❌ deleteProductAction error:", error);
    return { success: false, message: "Failed to delete product" };
  }
}

/**
 * Push sample seed catalog to MongoDB
 */
export async function seedInitialProductsAction() {
  await verifyAdminGuard();

  try {
    const db = await connectToDatabase();
    if (!db) {
      return {
        success: false,
        message: "MongoDB connection is not established. Please check MONGODB_URI.",
      };
    }

    const count = await Product.countDocuments();
    if (count > 0) {
      return {
        success: true,
        message: `Database already populated with ${count} products.`,
      };
    }

    const docs = INITIAL_PRODUCTS.map((p) => ({
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      category: p.category,
      sizes: p.sizes,
      colors: p.colors,
      images: p.images,
      inStock: p.inStock,
      featured: p.featured,
      tag: p.tag,
      fabric: p.fabric,
    }));

    await Product.insertMany(docs);
    revalidatePath("/");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Successfully seeded ${docs.length} products to MongoDB Atlas!`,
    };
  } catch (error) {
    console.error("❌ Seed error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Seeding failed",
    };
  }
}
