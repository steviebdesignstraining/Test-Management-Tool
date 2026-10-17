"use client";

import { Suspense, useState } from "react";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      {!isPublic && (
        <>
          {/* Mobile overlay */}
          {mobileDrawerOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
          )}
          {/* Mobile drawer */}
          <div
            className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
              mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar
              isCollapsed={false}
              onToggle={() => setMobileDrawerOpen(false)}
              isMobile
            />
          </div>
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Suspense fallback={null}>
              <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </Suspense>
          </div>
        </>
      )}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          !isPublic
            ? `${sidebarCollapsed ? "lg:pl-[64px]" : "lg:pl-[232px]"}`
            : ""
        }`}
      >
        {!isPublic && (
          <TopBar
            onMobileMenuClick={() => setMobileDrawerOpen(true)}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-[28px]">{children}</main>
      </div>
    </>
  );
}
