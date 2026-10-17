import PageHeader from "@/components/PageHeader";

export default function TestSuitesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Suites"
        title="Test Suites"
        description="Organize and manage test suites."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Test suite detail/list view coming soon.</p>
      </div>
    </div>
  );
}
