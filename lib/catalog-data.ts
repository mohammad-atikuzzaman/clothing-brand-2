export interface ProductType {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: "Men" | "Women" | "Minimalist" | "Accessories";
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  inStock: boolean;
  featured: boolean;
  tag?: string;
  fabric: string;
}

export const INITIAL_PRODUCTS: ProductType[] = [
  {
    id: "prod-1",
    slug: "heavyweight-oversized-tee-noir",
    title: "Signature Heavyweight Oversized Tee",
    subtitle: "260 GSM Ultra-Combed Organic Cotton",
    description:
      "Crafted with meticulous attention to silhouette, this heavyweight boxy tee provides the quintessential luxury streetwear drape. Pre-shrunk and double-needle stitched for eternal shape retention.",
    price: 1350,
    discountPrice: 1150,
    category: "Minimalist",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Washed Noir", hex: "#1c1c1c" },
      { name: "Raw Ecru", hex: "#eae6df" },
      { name: "Olive Slate", hex: "#4a5340" },
    ],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    featured: true,
    tag: "Best Seller",
    fabric: "100% Ring-Spun Organic Cotton (260 GSM)",
  },
  {
    id: "prod-2",
    slug: "luxury-drop-shoulder-hoodie",
    title: "French Terry Sculpted Hoodie",
    subtitle: "420 GSM Double-Faced Fleece",
    description:
      "An architectural silhouette with seamless drop shoulders and no drawstrings for a pure, ultra-clean aesthetic. Kangaroo pocket with hidden bar-tack reinforcement.",
    price: 2850,
    discountPrice: 2450,
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Oatmeal Heather", hex: "#d8d3cd" },
      { name: "Charcoal Void", hex: "#2b2b2b" },
      { name: "Midnight Navy", hex: "#1c2536" },
    ],
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    featured: true,
    tag: "Winter Drop",
    fabric: "420 GSM Double-Faced French Terry",
  },
  {
    id: "prod-3",
    slug: "tailored-relaxed-linen-trousers",
    title: "Minimalist Relaxed Linen Pant",
    subtitle: "Pure Belgian Flax Linen with Elastic Drawcord",
    description:
      "Engineered for effortless breathability and refined drape. Features deep front pleats, subtle back welt pockets, and custom antique nickel aglets.",
    price: 2150,
    discountPrice: 1890,
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Desert Sand", hex: "#d2b48c" },
      { name: "Deep Obsidian", hex: "#171717" },
      { name: "Sage Mist", hex: "#8a9a86" },
    ],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    featured: false,
    tag: "New Arrival",
    fabric: "100% Pure Woven Linen (210 GSM)",
  },
  {
    id: "prod-4",
    slug: "oversized-poplin-shirt",
    title: "Draped Cotton Poplin Studio Shirt",
    subtitle: "High-Count Long-Staple Egyptian Cotton",
    description:
      "A genderless, sculptural button-up shirt featuring dropped shoulders, pearl luster buttons, and an elongated back hem for modern layering.",
    price: 1950,
    discountPrice: 1650,
    category: "Women",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Pure Chalk", hex: "#f8f9fa" },
      { name: "Sky Glaze", hex: "#c9dbe7" },
      { name: "Espresso", hex: "#3e2723" },
    ],
    images: [
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    featured: true,
    tag: "Essential",
    fabric: "100% Long-Staple Poplin Cotton",
  },
  {
    id: "prod-5",
    slug: "boxy-interlock-waffle-knit-crew",
    title: "Thermal Waffle Boxy Longsleeve",
    subtitle: "320 GSM Textured Waffle Weave",
    description:
      "Textural luxury engineered for transitional weather. Heavy ribbed collar and cuffs with double lockstitch seam lines.",
    price: 1750,
    discountPrice: 1450,
    category: "Minimalist",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Pebble Grey", hex: "#9e9e9e" },
      { name: "Forest Moss", hex: "#354230" },
      { name: "Bone White", hex: "#f3ede2" },
    ],
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    featured: false,
    tag: "Trending",
    fabric: "100% Combed Thermal Cotton (320 GSM)",
  },
  {
    id: "prod-6",
    slug: "sculptural-tote-heavy-canvas",
    title: "Architect Heavyweight Canvas Tote",
    subtitle: "24oz Industrial Grade Duck Canvas",
    description:
      "Indestructible daily carry with reinforced boxed stitching, interior zippered stash pocket, and a dedicated 16-inch laptop compartment.",
    price: 1250,
    discountPrice: 990,
    category: "Accessories",
    sizes: ["One Size"],
    colors: [
      { name: "Raw Ecru", hex: "#e8e3d9" },
      { name: "Carbon Black", hex: "#1f1f1f" },
    ],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop",
    ],
    inStock: true,
    featured: false,
    tag: "Accessory",
    fabric: "24oz Industrial Cotton Duck Canvas",
  },
];
