import PageHeader from "@/components/PageHeader";

export default async function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Automation"
        title="Automation"
        description="Map automated scripts to manual test cases."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapped</p>
          <p className="text-3xl font-semibold text-[#1B2430]">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Automation mappings are not yet tracked.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Manual only</p>
          <p className="text-3xl font-semibold text-[#1B2430]">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Cases without an automation mapping.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Scripts without case</p>
          <p className="text-3xl font-semibold text-[#1B2430]">—</p>
          <p className="text-xs text-[#5B6675] mt-2">Automation scripts not linked to a case.</p>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Test case</th>
              <th className="table-header px-4 py-3">Script</th>
              <th className="table-header px-4 py-3">Confidence</th>
              <th className="table-header px-4 py-3">Source</th>
              <th className="table-header px-4 py-3">Verified</th>
              <th className="table-header px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td colSpan={6} className="px-4 py-3 text-[#5B6675] text-center">
                No automation mappings yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[#5B6675]">
        Code changes require a reviewable diff and explicit user approval before any automation source is modified.
      </div>
    </div>
  );
}
