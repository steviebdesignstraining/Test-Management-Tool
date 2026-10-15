import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TestHub - Test Management Platform",
  description: "AI-assisted test management, CI/CD results, defects and quality insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-[#F5F7F9] text-[#1B2430] pl-[232px]">
        <Sidebar collapsed={false} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </body>
    </html>
  );
}
