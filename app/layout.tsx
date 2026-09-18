import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getStoreSettingsAction } from "@/actions/settings-actions";
import { MetaPixel } from "@/components/meta-pixel";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noiratelier.com"),
  title: {
    default: "NOIR ATELIER | Studio Clothing & Architectural Basics",
    template: "%s | NOIR ATELIER",
  },
  description:
    "Contemporary heavyweight clothing brand. Crafted from 240+ GSM organic combed cotton with pure architectural drape. Cash on Delivery available across Bangladesh.",
  keywords: [
    "NOIR ATELIER",
    "heavyweight t-shirt",
    "minimalist clothing bangladesh",
    "streetwear dhaka",
    "cash on delivery clothing",
    "oversized tee",
  ],
  authors: [{ name: "NOIR ATELIER Studio" }],
  openGraph: {
    title: "NOIR ATELIER | Studio Clothing & Architectural Basics",
    description:
      "Contemporary heavyweight clothing brand. Crafted from 240+ GSM organic cotton with pure architectural drape. Cash on Delivery across all 64 districts.",
    url: "https://noiratelier.com",
    siteName: "NOIR ATELIER",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIR ATELIER | Studio Clothing & Architectural Basics",
    description:
      "Contemporary heavyweight streetwear basics with nationwide Cash on Delivery in Bangladesh.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettingsAction();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {settings.facebookDomainVerification && (
          <meta
            name="facebook-domain-verification"
            content={settings.facebookDomainVerification}
          />
        )}
        <MetaPixel pixelId={settings.metaPixelId} />
        {children}
      </body>
    </html>
  );
}
