import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Automation"
        title="Automation"
        description="Map automated scripts to manual test cases."
      />

      <div className="flex border-b border-[#C9D0D8]">
        <button className="px-4 py-3 border-b-2 border-[#1F6F8B] text-[#1F6F8B] text-sm font-medium">Repositories</button>
        <button className="px-4 py-3 border-b-2 border-transparent text-[#5B6675] text-sm font-medium hover:text-[#1B2430]">Scripts</button>
        <button className="px-4 py-3 border-b-2 border-transparent text-[#5B6675] text-sm font-medium hover:text-[#1B2430]">Mappings</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapped</p>
          <p className="text-3xl font-semibold text-[#1B2430]">14 <span className="sample-badge">Sample data</span></p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Manual only</p>
          <p className="text-3xl font-semibold text-[#1B2430]">28 <span className="sample-badge">Sample data</span></p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Scripts without case</p>
          <p className="text-3xl font-semibold text-[#1B2430]">6 <span className="sample-badge">Sample data</span></p>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header">Test case</th>
              <th className="table-header">Script</th>
              <th className="table-header">Confidence</th>
              <th className="table-header">Source</th>
              <th className="table-header">Verified</th>
              <th className="table-header text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#1B2430] font-medium">TC-001</td>
              <td className="px-4 py-3 text-[#5B6675]">login_test.py</td>
              <td className="px-4 py-3"><span className="badge status-pass">95% <span className="sample-badge" style={{ marginLeft: "6px" }}>Sample</span></span></td>
              <td className="px-4 py-3 text-[#5B6675]">Approved mapping</td>
              <td className="px-4 py-3 text-[#5B6675]">2h ago</td>
              <td className="px-4 py-3 text-right">
                <Link href="#" className="btn-link text-sm">Change</Link>
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
