import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex bg-[#F5F7F9] text-[#1B2430] pl-[232px]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-[28px]">{children}</main>
        </div>
      </body>
    </html>
  );
}
