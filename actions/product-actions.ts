"use server";

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { INITIAL_PRODUCTS, ProductType } from "@/lib/catalog-data";

export async function getProductsAction(): Promise<{
  products: ProductType[];
  source: "MongoDB" | "Static Catalog";
}> {
  try {
    const db = await connectToDatabase();
    if (db) {
      const dbProducts = await Product.find({ inStock: true }).lean();
      if (dbProducts && dbProducts.length > 0) {
        const formatted: ProductType[] = dbProducts.map((p) => ({
          id: p._id.toString(),
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle || "",
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice,
          category: p.category as "Men" | "Women" | "Minimalist" | "Accessories",
          sizes: p.sizes,
          colors: p.colors,
          images: p.images,
          inStock: p.inStock,
          featured: p.featured,
          tag: p.tag,
          fabric: p.fabric || "Premium Cotton",
        }));
        return { products: formatted, source: "MongoDB" };
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not read products from MongoDB, falling back to static catalog:", err);
  }

  // High performance static catalog fallback
  return { products: INITIAL_PRODUCTS, source: "Static Catalog" };
}

export async function seedInitialProductsAction(secretKey?: string) {
  const expectedKey = process.env.ADMIN_SECRET_KEY || "admin12345";
  if (secretKey !== expectedKey) {
    return { success: false, message: "Unauthorized." };
  }

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
    return {
      success: true,
      message: `Successfully seeded ${docs.length} products to MongoDB!`,
    };
  } catch (error) {
    console.error("❌ Seed error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Seeding failed",
    };
  }
}
