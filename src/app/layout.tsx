import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "پدیده تجارت الوند | قطعات یدکی اصلی خودرو",
    template: "%s | پدیده تجارت الوند",
  },
  description:
    "مرجع تخصصی تامین قطعات یدکی اصلی خودرو — ترمز، تعلیق، موتور، فیلتر، برق و روشنایی با ضمانت اصالت کالا و ارسال سراسری.",
  keywords: [
    "قطعات یدکی خودرو",
    "لوازم یدکی اصلی",
    "پدیده تجارت الوند",
    "دیسک ترمز",
    "لنت ترمز",
    "قطعات موتور",
  ],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-white font-sans text-zinc-700 antialiased">
        {children}
      </body>
    </html>
  );
}
