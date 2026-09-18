import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
