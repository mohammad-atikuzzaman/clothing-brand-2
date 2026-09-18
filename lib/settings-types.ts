export interface StoreSettingsType {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  supportHours: string;
  announcement: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeShippingThreshold: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettingsType = {
  phone: "+880 1888-299388",
  email: "concierge@noiratelier.com",
  whatsapp: "+880 1888-299388",
  address: "Level 4, Plot 18, Road 11, Block D, Banani, Dhaka - 1213",
  facebookUrl: "https://facebook.com/noiratelier.bd",
  instagramUrl: "https://instagram.com/noiratelier.studio",
  youtubeUrl: "https://youtube.com/@noiratelier",
  tiktokUrl: "https://tiktok.com/@noiratelier",
  supportHours: "Everyday: 10:00 AM - 10:00 PM BST",
  announcement: "Cash on Delivery (COD) Available Nationwide • No Advance Payment Required",
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  freeShippingThreshold: 3000,
};
