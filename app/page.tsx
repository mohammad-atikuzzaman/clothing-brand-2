import { getProductsAction } from "@/actions/product-actions";
import { getStoreSettingsAction } from "@/actions/settings-actions";
import { StoreView } from "@/components/store-view";

// Incremental Static Regeneration (ISR): Cache rendered page at Vercel Edge for 1 hour
// High traffic will be served directly from CDN with 0 database roundtrips!
export const revalidate = 3600;

export default async function HomePage() {
  const [{ products, source }, settings] = await Promise.all([
    getProductsAction(),
    getStoreSettingsAction(),
  ]);

  return (
    <StoreView
      initialProducts={products}
      dataSource={source}
      settings={settings}
    />
  );
}
