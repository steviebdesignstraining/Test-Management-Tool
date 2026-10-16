import PublicContentPage from "@/components/PublicContentPage";
import { HomeIcon, ProjectsIcon, FileTextIcon, ActivityIcon, AutomationIcon, DefectsIcon, AiAssistantIcon, AnalyticsIcon, LinkIcon } from "@/components/icons";

const docs = [
  { title: "Getting Started", description: "Create your account, set up your organisation, and invite your team.", href: "/docs/getting-started", icon: <HomeIcon className="text-[#1F6F8B]" /> },
  { title: "Projects & Teams", description: "Manage projects, roles, and team member access.", href: "/docs/projects", icon: <ProjectsIcon className="text-[#1F6F8B]" /> },
  { title: "Test Cases", description: "Create, edit, and organize test cases with steps and custom fields.", href: "/docs/test-cases", icon: <FileTextIcon className="text-[#1F6F8B]" /> },
  { title: "Test Plans & Runs", description: "Design test plans, schedule runs, and track execution.", href: "/docs/test-runs", icon: <ActivityIcon className="text-[#1F6F8B]" /> },
  { title: "Automation", description: "Integrate CI/CD pipelines and import automated test results.", href: "/docs/automation", icon: <AutomationIcon className="text-[#1F6F8B]" /> },
  { title: "Defects", description: "Track and resolve defects with full context and assignment.", href: "/docs/defects", icon: <DefectsIcon className="text-[#1F6F8B]" /> },
  { title: "AI Assistant", description: "Use AI to generate test cases and gain quality insights.", href: "/docs/ai-assistant", icon: <AiAssistantIcon className="text-[#1F6F8B]" /> },
  { title: "Analytics", description: "Interpret dashboards and coverage reports.", href: "/docs/analytics", icon: <AnalyticsIcon className="text-[#1F6F8B]" /> },
  { title: "API Reference", description: "Full REST API documentation for integrations.", href: "/docs/api", icon: <LinkIcon className="text-[#1F6F8B]" /> },
];

export default function DocsPage() {
  return (
    <PublicContentPage
      badge="Documentation"
      title="Learn how to use TestHub"
      subtitle="Get started with TestHub and master every feature with our guides and tutorials."
      items={docs}
    />
  );
}
