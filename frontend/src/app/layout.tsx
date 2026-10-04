import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalinO-Crop | AI Salinity Forecasting for Coastal Bangladesh",
  description:
    "AI-driven root-zone salinity forecasting platform. Converts satellite data into plot-level Bengali planting advice for coastal Bangladesh farmers.",
  keywords: ["salinity", "Bangladesh", "agriculture", "coastal", "AI", "crop recommendation"],
  authors: [{ name: "DIU Hustle Brigade" }],
  openGraph: {
    title: "SalinO-Crop",
    description: "See the salt before it kills the crop.",
    type: "website",
  },
};

import { Header } from "@/components/layout/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="light">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
