import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Catalog Scanner",
  description:
    "Admin-only capture tool — scan pet-food barcodes and photograph labels to seed verified ingredients into ingredients.help.",
  robots: { index: false, follow: false },
  applicationName: "Catalog Scanner",
  appleWebApp: {
    capable: true,
    title: "Catalog Scanner",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#20251F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-[100dvh] font-sans">{children}</body>
    </html>
  );
}
