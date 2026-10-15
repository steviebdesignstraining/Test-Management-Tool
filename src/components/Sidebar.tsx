"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { name: "Overview", href: "/overview", icon: "📊" },
  { name: "Projects", href: "/projects", icon: "🏢" },
  { name: "Test Cases", href: "/test-cases", icon: "📋" },
  { name: "Test Plans", href: "/test-plans", icon: "📅" },
  { name: "Test Runs", href: "/test-runs", icon: "▶️" },
  { name: "Test Strategies", href: "/strategies", icon: "📘" },
  { name: "Automation", href: "/automation", icon: "🤖" },
  { name: "CI/CD Runs", href: "/ci-cd", icon: "⚙️" },
  { name: "Defects", href: "/defects", icon: "🐛" },
  { name: "Reports / Allure", href: "/reports", icon: "📈" },
  { name: "Analytics / AI Insights", href: "/analytics", icon: "🧠" },
  { name: "Integrations", href: "/integrations", icon: "🔌" },
  { name: "Team and Access", href: "/team", icon: "👥" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 border-r border-[#C9D0D8] bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-[232px]"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-[#C9D0D8] px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
        </Link>
        <button
          className="rounded p-1 text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
          aria-label="Toggle sidebar"
        >
          <span className="sr-only">Toggle sidebar</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#E4F0F4] text-[#134F63]"
                  : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
              }`}
            >
              <span className="w-6 text-center">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#C9D0D8]">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]">
          <span className="w-6 text-center">👤</span>
          {!collapsed && <span>Profile</span>}
        </button>
      </div>
    </aside>
  );
}
