import PublicLayout from "@/components/PublicLayout";

const integrations = [
  { name: "GitHub", description: "Link test cases and defects to GitHub issues and pull requests." },
  { name: "GitLab", description: "Sync repositories and link CI/CD pipelines to test results." },
  { name: "Jira", description: "Push defects and test execution data to Jira for traceability." },
  { name: "Slack", description: "Receive notifications about test runs, failures, and quality metrics." },
  { name: "Jenkins", description: "Import build and pipeline execution results into test reports." },
  { name: "CircleCI", description: "Stream test results from CircleCI workflows in real time." },
  { name: "TestCafe", description: "Import automated test results and screenshots from TestCafe runs." },
  { name: "Cypress", description: "Connect Cypress test results and generate traces from failures." },
  { name: "Playwright", description: "Import Playwright test results, traces, and videos." },
  { name: "REST API", description: "Full REST API for importing test results from any CI/CD system." },
];

export default function IntegrationsPage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[#1F6F8B] bg-[#E4F0F4] rounded-full border border-[#B7D9E2]">
            Integrations
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Connect your existing tools
          </h1>
          <p className="text-lg text-[#5B6675] max-w-2xl mx-auto leading-relaxed">
            TestHub integrates with popular CI/CD platforms, issue trackers, and communication tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((i) => (
            <div key={i.name} className="p-6 border border-[#C9D0D8] rounded-lg bg-white">
              <h3 className="text-base font-semibold mb-3">{i.name}</h3>
              <p className="text-sm text-[#5B6675] leading-relaxed">{i.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
