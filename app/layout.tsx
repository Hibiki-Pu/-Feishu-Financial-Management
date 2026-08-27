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
  title: "衡远财务｜成本与研发驾驶舱",
  description: "企业人工成本、研发投入、部门预算与飞书文档的一体化管理平台。",
  openGraph: {
    title: "衡远财务｜成本与研发驾驶舱",
    description: "统一查看企业人工成本、研发投入、预算执行和财务文档。",
  },
  twitter: {
    card: "summary_large_image",
    title: "衡远财务｜成本与研发驾驶舱",
    description: "统一查看企业人工成本、研发投入、预算执行和财务文档。",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
