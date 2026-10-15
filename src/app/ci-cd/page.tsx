import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function CiCdPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="CI/CD Runs"
        title="CI/CD Runs"
        description="View pipeline results and quality gates."
        actions={
          <button className="btn-primary">Connect CI</button>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header">Workflow</th>
              <th className="table-header">Branch</th>
              <th className="table-header">Commit</th>
              <th className="table-header">Actor</th>
              <th className="table-header">Status</th>
              <th className="table-header">Tests</th>
              <th className="table-header">Duration</th>
              <th className="table-header text-right">Allure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3 text-[#1B2430] font-medium">CI Tests</td>
              <td className="px-4 py-3 text-[#5B6675]">main</td>
              <td className="px-4 py-3 text-[#5B6675] font-mono text-xs">a1b2c3d</td>
              <td className="px-4 py-3 text-[#5B6675]">Alex Rivera</td>
              <td className="px-4 py-3"><span className="badge status-pass">Passed</span></td>
              <td className="px-4 py-3 text-[#5B6675]">42 / 42 <span className="sample-badge" style={{ marginLeft: "6px" }}>Sample</span></td>
              <td className="px-4 py-3 text-[#5B6675]">3m 12s</td>
              <td className="px-4 py-3 text-right"><Link href="#" className="text-[#1F6F8B] text-sm hover:underline">View report</Link></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Run detail</h3>
          <p className="text-xs text-[#5B6675]">Select a run to see jobs, failure types, retries and a link to the original GitHub run.</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
          <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Quality gates</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#5B6675]">Minimum pass rate (90%)</span>
              <span className="badge status-pass">Met</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5B6675]">No critical failures</span>
              <span className="badge status-pass">Met</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
