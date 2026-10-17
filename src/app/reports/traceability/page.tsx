import PageHeader from "@/components/PageHeader";

export default function TraceabilityMatrixPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Reports / Traceability Matrix"
        title="Traceability Matrix"
        description="Trace requirements to test cases, executions, and defects."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Traceability matrix coming soon.</p>
      </div>
    </div>
  );
}
