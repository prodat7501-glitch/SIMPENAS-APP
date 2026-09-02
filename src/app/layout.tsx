import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "SIMPENAS — KPU Kabupaten Gorontalo",
  description:
    "Sistem Informasi Manajemen Perjalanan Dinas Komisi Pemilihan Umum Kabupaten Gorontalo",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo-kpu.png",
    shortcut: "/images/logo-kpu.png",
    apple: "/images/logo-kpu.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
