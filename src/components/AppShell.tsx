"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";

const PUBLIC_PATHS = ["/", "/sign-in", "/register", "/forgot-password", "/reset-password"];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  return (
    <body className={`min-h-full flex bg-[#F5F7F9] text-[#1B2430] ${isPublic ? "pl-0" : "pl-[232px]"}`}>
      {!isPublic && (
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isPublic && <TopBar />}
        <main className="flex-1 overflow-y-auto p-[28px]">{children}</main>
      </div>
    </body>
  );
}
