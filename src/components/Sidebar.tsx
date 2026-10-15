"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { name: "Overview", href: "/overview" },
  { name: "Projects", href: "/projects" },
  { name: "Test Cases", href: "/test-cases" },
  { name: "Test Plans", href: "/test-plans" },
  { name: "Test Runs", href: "/test-runs" },
  { name: "Test Strategies", href: "/strategies" },
  { name: "Automation", href: "/automation" },
  { name: "CI/CD Runs", href: "/ci-cd" },
  { name: "Defects", href: "/defects" },
  { name: "Reports / Allure", href: "/reports" },
  { name: "Analytics / AI Insights", href: "/analytics" },
  { name: "Integrations", href: "/integrations" },
  { name: "Team and Access", href: "/team" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 border-r border-[#C9D0D8] bg-white w-[232px]">
      <div className="flex h-14 items-center justify-between border-b border-[#C9D0D8] px-4">
        <Link href="/overview" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#E4F0F4] text-[#134F63]"
                  : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#C9D0D8]">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]">
          <span className="w-6 text-center">☰</span>
          <span>Profile</span>
        </button>
      </div>
    </aside>
  );
}
