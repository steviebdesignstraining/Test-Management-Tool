import PublicLayout from "@/components/PublicLayout";

const features = [
  { title: "Test case management", description: "Create, organize, and maintain test cases with rich descriptions, preconditions, steps, and custom fields." },
  { title: "Test planning & execution", description: "Design test plans, schedule test runs, and track execution results with real-time status updates." },
  { title: "AI-assisted authoring", description: "Leverage Gemini AI to generate test cases from requirements, suggest edge cases, and review coverage." },
  { title: "Automation integration", description: "Connect CI/CD pipelines to import test results automatically and link failures to defects." },
  { title: "Defect tracking", description: "Capture, assign, and resolve bugs with full context, screenshots, and audit trails." },
  { title: "Requirements coverage", description: "Trace requirements to test cases and runs to see exactly what is covered and what is at risk." },
  { title: "Quality analytics", description: "Interactive dashboards with coverage, pass/fail trends, and AI-powered quality insights." },
  { title: "Role-based access", description: "Control who can view, edit, or manage each project with owner, manager, tester, and viewer roles." },
  { title: "Audit history", description: "Every workflow change is logged with who, what, and when for full compliance and traceability." },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[#1F6F8B] bg-[#E4F0F4] rounded-full border border-[#B7D9E2]">
            Features
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Everything you need for quality engineering
          </h1>
          <p className="text-lg text-[#5B6675] max-w-2xl mx-auto leading-relaxed">
            TestHub brings manual testing, automation, CI/CD results, defects, and AI insights into one workspace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 border border-[#C9D0D8] rounded-lg bg-white">
              <h3 className="text-base font-semibold mb-3">{f.title}</h3>
              <p className="text-sm text-[#5B6675] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
