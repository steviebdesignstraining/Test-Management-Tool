import PublicLayout from "@/components/PublicLayout";
import Link from "next/link";

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
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[#1F6F8B] bg-[#E4F0F4] rounded-full border border-[#B7D9E2]">
            Documentation
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Learn how to use TestHub
          </h1>
          <p className="text-lg text-[#5B6675] max-w-2xl mx-auto leading-relaxed">
            Get started with TestHub and master every feature with our guides and tutorials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docs.map((d) => (
            <Link key={d.title} href={d.href} className="block p-6 border border-[#C9D0D8] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors">
              <h3 className="text-base font-semibold mb-3">{d.title}</h3>
              <p className="text-sm text-[#5B6675] leading-relaxed">{d.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
