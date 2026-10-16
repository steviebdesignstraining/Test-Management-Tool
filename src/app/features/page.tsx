import PublicContentPage from "@/components/PublicContentPage";
import { TestCasesIcon, TestPlansIcon, AiAssistantIcon, AutomationIcon, DefectsIcon, RequirementsIcon, AnalyticsIcon, ShieldIcon } from "@/components/icons";

const features = [
  {
    title: "Test case management",
    description: "Create, organize, and maintain test cases with rich descriptions, preconditions, steps, and custom fields.",
    icon: <TestCasesIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "Test planning & execution",
    description: "Design test plans, schedule test runs, and track execution results with real-time status updates.",
    icon: <TestPlansIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "AI-assisted authoring",
    description: "Leverage Gemini AI to generate test cases from requirements, suggest edge cases, and review coverage.",
    icon: <AiAssistantIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "Automation integration",
    description: "Connect CI/CD pipelines to import test results automatically and link failures to defects.",
    icon: <AutomationIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "Defect tracking",
    description: "Capture, assign, and resolve bugs with full context, screenshots, and audit trails.",
    icon: <DefectsIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "Requirements coverage",
    description: "Trace requirements to test cases and runs to see exactly what is covered and what is at risk.",
    icon: <RequirementsIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "Quality analytics",
    description: "Interactive dashboards with coverage, pass/fail trends, and AI-powered quality insights.",
    icon: <AnalyticsIcon className="text-[#1F6F8B]" />,
  },
  {
    title: "Role-based access",
    description: "Control who can view, edit, or manage each project with owner, manager, tester, and viewer roles.",
    icon: <ShieldIcon className="text-[#1F6F8B]" />,
  },
];

export default function FeaturesPage() {
  return (
    <PublicContentPage
      badge="Features"
      title="Everything you need for quality engineering"
      subtitle="TestHub brings manual testing, automation, CI/CD results, defects, and AI insights into one workspace."
      items={features}
    />
  );
}
