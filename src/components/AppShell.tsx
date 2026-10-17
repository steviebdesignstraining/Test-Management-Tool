"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/features",
  "/integrations",
  "/security",
  "/docs",
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  return (
    <>
      {!isPublic && (
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
      )}
      <div className={`flex-1 flex flex-col overflow-hidden ${!isPublic ? "pl-[232px]" : ""}`}>
        {!isPublic && <TopBar />}
        <main className="flex-1 overflow-y-auto p-[28px]">{children}</main>
      </div>
    </>
  );
}
