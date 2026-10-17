import PageHeader from "@/components/PageHeader";

export default async function TestRunDetailPage({
  params,
}: {
  params: Promise<{ testRunId: string }>;
}) {
  const { testRunId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Runs / Details"
        title={`Test Run ${testRunId}`}
        description="Test run details with step results and filters."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Test run detail coming soon.</p>
      </div>
    </div>
  );
}
