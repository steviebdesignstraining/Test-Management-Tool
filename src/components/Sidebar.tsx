"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ isCollapsed = false, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children && item.children.some((c) => pathname.startsWith(c.href) || pathname.startsWith(item.href))) {
        newExpanded[item.name] = true;
      }
    });
    if (Object.keys(newExpanded).length > 0) {
      setExpanded(newExpanded);
    }
  }, [pathname]);

  const toggleGroup = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isChildActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const ChevronLeft = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const ChevronRight = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 border-r border-[#C9D0D8] bg-white transition-all duration-300 ${
        isCollapsed && !isMobile ? "w-[64px]" : "w-[232px]"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-[#C9D0D8] px-4">
        <Link href="/overview" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">
            {isCollapsed && !isMobile ? "TH" : "TestHub"}
          </span>
        </Link>
        {!isMobile && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-1.5 text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        )}
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
                  if (isMobile && onToggle) {
                    onToggle();
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E4F0F4] text-[#134F63]"
                    : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
                } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                  {item.icon}
                </span>
                {(!isCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
              </Link>
            );
          }

          return (
            <div key={item.name} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(item.name)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#E4F0F4] text-[#134F63]"
                    : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
                } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                  {item.icon}
                </span>
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto shrink-0 transform transition-transform duration-200 text-[#5B6675]">
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  </>
                )}
              </button>
              {(!isCollapsed || isMobile) && (
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-7 space-y-0.5 pt-0.5">
                    {item.children?.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={(e) => {
                            if (isMobile && onToggle) {
                              onToggle();
                            }
                          }}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                            childActive
                              ? "bg-[#E4F0F4] text-[#134F63] font-medium"
                              : "text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]"
                          }`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                            {child.icon}
                          </span>
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#C9D0D8]">
        <Link
          href="/profile"
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430] transition-all duration-200 ${
            isCollapsed && !isMobile ? "justify-center px-2" : ""
          }`}
          title={isCollapsed && !isMobile ? "Profile" : undefined}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">☰</span>
          {(!isCollapsed || isMobile) && <span>Profile</span>}
        </Link>
      </div>
    </aside>
  );
}
