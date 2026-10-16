import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <AppShell>{children}</AppShell>
    </html>
  );
}
