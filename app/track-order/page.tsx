import type { Metadata } from "next";
import { getStoreSettingsAction } from "@/actions/settings-actions";
import { TrackOrderClient } from "@/components/track-order-client";

export const metadata: Metadata = {
  title: "Track Your Order | NOIR ATELIER",
  description:
    "Check live delivery status and fulfillment progress for your NOIR ATELIER Cash on Delivery orders across Bangladesh.",
  openGraph: {
    title: "Track Your Order | NOIR ATELIER",
    description:
      "Check live delivery status and fulfillment progress for your NOIR ATELIER orders.",
  },
};

export default async function TrackOrderPage() {
  const settings = await getStoreSettingsAction();

  return <TrackOrderClient settings={settings} />;
}
