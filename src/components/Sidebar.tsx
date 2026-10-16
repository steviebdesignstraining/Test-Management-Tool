"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  OverviewIcon,
  TestCasesIcon,
  TestRunsIcon,
  TestPlansIcon,
  StrategiesIcon,
  AiAssistantIcon,
  RequirementsIcon,
  AutomationIcon,
  CiCdIcon,
  ReportsIcon,
  DefectsIcon,
  AnalyticsIcon,
  IntegrationsIcon,
  TeamIcon,
  SettingsIcon,
  OrganisationIcon,
  ProjectsIcon,
  UsersIcon,
  ClipboardIcon,
  ShieldIcon,
  GlobeIcon,
} from "@/components/icons";

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/overview", icon: <OverviewIcon /> },
  {
    name: "Tests",
    href: "/test-cases",
    icon: <TestCasesIcon />,
    children: [
      { name: "Test Cases", href: "/test-cases", icon: <TestCasesIcon /> },
      { name: "Test Runs", href: "/test-runs", icon: <TestRunsIcon /> },
      { name: "Test Plans", href: "/test-plans", icon: <TestPlansIcon /> },
      { name: "Test Strategies", href: "/strategies", icon: <StrategiesIcon /> },
    ],
  },
  { name: "AI Assistant", href: "/ai-assistant", icon: <AiAssistantIcon /> },
  { name: "Requirements", href: "/requirements", icon: <RequirementsIcon /> },
  {
    name: "Automation",
    href: "/automation",
    icon: <AutomationIcon />,
    children: [
      { name: "Automation", href: "/automation", icon: <AutomationIcon /> },
      { name: "Environments", href: "/environments", icon: <GlobeIcon /> },
      { name: "CI/CD Runs", href: "/ci-cd", icon: <CiCdIcon /> },
      { name: "Reports / Allure", href: "/reports", icon: <ReportsIcon /> },
    ],
  },
  { name: "Defects", href: "/defects", icon: <DefectsIcon /> },
  {
    name: "Quality",
    href: "/analytics",
    icon: <AnalyticsIcon />,
    children: [
      { name: "Analytics / AI Insights", href: "/analytics", icon: <AnalyticsIcon /> },
      { name: "Quality Gates", href: "/quality-gates", icon: <ShieldIcon /> },
      { name: "Audit Logs", href: "/audit-logs", icon: <ClipboardIcon /> },
    ],
  },
  {
    name: "Workspace",
    href: "/organisations",
    icon: <TeamIcon />,
    children: [
      { name: "Organisations", href: "/organisations", icon: <OrganisationIcon /> },
      { name: "Projects", href: "/projects", icon: <ProjectsIcon /> },
      { name: "Team and Access", href: "/team", icon: <UsersIcon /> },
      { name: "Integrations", href: "/integrations", icon: <IntegrationsIcon /> },
      { name: "Settings", href: "/settings", icon: <SettingsIcon /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleGroup = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isChildActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((c) => pathname === c.href);
    }
    return pathname === item.href;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 border-r border-[#C9D0D8] bg-white w-[232px]">
      <div className="flex h-14 items-center justify-between border-b border-[#C9D0D8] px-4">
        <Link href="/overview" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = isChildActive(item);
          const hasChildren = !!item.children;
          const isExpanded = expanded[item.name] ?? isActive;

          if (!hasChildren) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E4F0F4] text-[#134F63]"
                    : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
                }}`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{item.icon}</span>
                {item.name}
              </Link>
            );
          }

          return (
            <div key={item.name} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(item.name)}
                className={`flex w-full items-center gap-3 justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E4F0F4] text-[#134F63]"
                    : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
                }}`}
              >
                 <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{item.icon}</span>
                <span>{item.name}</span>
                <span
                  className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                >
                  ▾
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }}`}
              >
                <div className="ml-4 space-y-0.5 pt-0.5">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(child.href);
                        }}
                        className={`flex items-center gap-3 block text-xs rounded-lg px-3 py-2 transition-all duration-200 ${
                          childActive
                            ? "bg-[#E4F0F4] text-[#134F63] font-medium"
                            : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
                        }}`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{child.icon}</span>
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#C9D0D8]">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430] transition-all duration-200">
          <span className="w-5 text-center">☰</span>
          <span>Profile</span>
        </button>
      </div>
    </aside>
  );
}
