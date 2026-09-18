import type { Metadata } from "next";
import { getStoreSettingsAction } from "@/actions/settings-actions";
import { ContactPageClient } from "@/components/contact-page-client";

export const metadata: Metadata = {
  title: "Contact & Concierge Desk | NOIR ATELIER",
  description:
    "Get in touch with the NOIR ATELIER Dhaka concierge desk for sizing guidance, order status tracking, cash on delivery inquiries, and studio exchanges.",
  openGraph: {
    title: "Contact & Concierge Desk | NOIR ATELIER",
    description:
      "Direct support, sizing guidance, and courier status tracking for NOIR ATELIER orders.",
  },
};

export default async function ContactPage() {
  const settings = await getStoreSettingsAction();

  return <ContactPageClient initialSettings={settings} />;
}
