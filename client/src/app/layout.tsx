import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Anjaneya Pharmacy | Trusted Medicines. Genuine Care.",
  description: "Order genuine medicines online from Anjaneya Pharmacy. Fast delivery within 60 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Anjaneya" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f5f7fa] overscroll-none" style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
          <InstallPrompt />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
