import PageHeader from "@/components/PageHeader";

export default function TestExecutionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Executions"
        title="Test Executions"
        description="Execute tests with step-by-step tracking."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Test execution workspace coming soon.</p>
      </div>
    </div>
  );
}
