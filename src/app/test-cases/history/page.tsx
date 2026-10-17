import PageHeader from "@/components/PageHeader";

export default function TestCaseHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Cases / History"
        title="Test Case History"
        description="Version history and comparison."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Test case version history and compare coming soon.</p>
      </div>
    </div>
  );
}
