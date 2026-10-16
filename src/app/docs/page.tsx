import PublicContentPage from "@/components/PublicContentPage";

const docs = [
  { title: "Getting Started", description: "Create your account, set up your organisation, and invite your team.", href: "/docs/getting-started" },
  { title: "Projects & Teams", description: "Manage projects, roles, and team member access.", href: "/docs/projects" },
  { title: "Test Cases", description: "Create, edit, and organize test cases with steps and custom fields.", href: "/docs/test-cases" },
  { title: "Test Plans & Runs", description: "Design test plans, schedule runs, and track execution.", href: "/docs/test-runs" },
  { title: "Automation", description: "Integrate CI/CD pipelines and import automated test results.", href: "/docs/automation" },
  { title: "Defects", description: "Track and resolve defects with full context and assignment.", href: "/docs/defects" },
  { title: "AI Assistant", description: "Use AI to generate test cases and gain quality insights.", href: "/docs/ai-assistant" },
  { title: "Analytics", description: "Interpret dashboards and coverage reports.", href: "/docs/analytics" },
  { title: "API Reference", description: "Full REST API documentation for integrations.", href: "/docs/api" },
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
