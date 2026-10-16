import PublicContentPage from "@/components/PublicContentPage";

const integrations = [
  { title: "GitHub", description: "Link test cases and defects to GitHub issues and pull requests.", href: "/docs" },
  { title: "GitLab", description: "Sync repositories and link CI/CD pipelines to test results.", href: "/docs" },
  { title: "Jira", description: "Push defects and test execution data to Jira for traceability.", href: "/docs" },
  { title: "Slack", description: "Receive notifications about test runs, failures, and quality metrics.", href: "/docs" },
  { title: "Jenkins", description: "Import build and pipeline execution results into test reports.", href: "/docs" },
  { title: "CircleCI", description: "Stream test results from CircleCI workflows in real time.", href: "/docs" },
  { title: "TestCafe", description: "Import automated test results and screenshots from TestCafe runs.", href: "/docs" },
  { title: "Cypress", description: "Connect Cypress test results and generate traces from failures.", href: "/docs" },
  { title: "Playwright", description: "Import Playwright test results, traces, and videos.", href: "/docs" },
  { title: "REST API", description: "Full REST API for importing test results from any CI/CD system.", href: "/docs" },
];

export default function IntegrationsPage() {
  return (
    <PublicContentPage
      badge="Integrations"
      title="Connect your existing tools"
      subtitle="TestHub integrates with popular CI/CD platforms, issue trackers, and communication tools."
      items={integrations}
    />
  );
}
