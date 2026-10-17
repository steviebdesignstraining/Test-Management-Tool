import PageHeader from "@/components/PageHeader";

export default function MilestonesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Releases & Milestones"
        title="Releases & Milestones"
        description="Track plans, runs, defects, and readiness."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Milestones and release readiness coming soon.</p>
      </div>
    </div>
  );
}
