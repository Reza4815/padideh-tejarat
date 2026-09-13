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
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      data-palette="gold"
      suppressHydrationWarning
    >
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var t=localStorage.getItem('theme');
              var p=window.matchMedia('(prefers-color-scheme: dark)').matches;
              if(t==='dark'||(!t&&p)){document.documentElement.classList.add('dark');}
              var pal=localStorage.getItem('palette');
              if(pal==='blue'){document.documentElement.setAttribute('data-palette','blue');}
            }catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-zinc-700 antialiased">
        {children}
      </body>
    </html>
  );
}
