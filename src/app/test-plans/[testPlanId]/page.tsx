import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function TestPlanDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Plans"
        title="Q4 Regression — Test plan detail"
        description="Sprint 14 • Regression cycle"
        actions={
          <div className="flex items-center gap-2">
            <Link href="#" className="btn-link text-sm mr-3">Export summary</Link>
            <Link href="#" className="btn-link text-sm mr-3">Snapshot</Link>
            <button className="btn-primary text-xs px-3 py-1.5">New run</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Progress</h2>
            <div className="w-full bg-[#EDF0F3] h-2 rounded-full mb-2">
              <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: "70%" }} />
            </div>
            <p className="text-[10px] text-[#5B6675]">70% (14/20) <span className="sample-badge">Sample data</span></p>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Plan summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Scope</p>
                <p className="text-[#1B2430]">Checkout flow, Payment processing</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Environments</p>
                <p className="text-[#1B2430]">Staging, Production</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Risks</p>
                <p className="text-[#1B2430]">Payment gateway downtime</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Reviewers</p>
                <p className="text-[#1B2430]">QA Lead, Product</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Entry criteria</p>
                <p className="text-[#1B2430]">All test cases authored and reviewed</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Exit criteria</p>
                <p className="text-[#1B2430]">No critical or high defects open</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h2 className="text-sm font-semibold text-[#1B2430] mb-3">Cycles and assignments</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F9]">
                <tr>
                  <th className="table-header px-4 py-2">Cycle</th>
                  <th className="table-header px-4 py-2">Status</th>
                  <th className="table-header px-4 py-2">Assignee</th>
                  <th className="table-header px-4 py-2">Progress</th>
                  <th className="table-header px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D0D8]">
                <tr>
                  <td className="px-4 py-2 text-[#1B2430] font-medium">Cycle 1</td>
                  <td className="px-4 py-2"><span className="badge status-pass">In progress</span></td>
                  <td className="px-4 py-2 text-[#5B6675]">Sam Chen</td>
                  <td className="px-4 py-2 text-[#5B6675]">14/20</td>
                  <td className="px-4 py-2 text-right"><Link href="#" className="btn-link text-sm">Execute</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Metadata</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Key</p>
                <p className="text-[#1B2430] font-medium">TP-001</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Owner</p>
                <p className="text-[#5B6675]">Sam Chen</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5B6675] uppercase tracking-wider">Project</p>
                <p className="text-[#5B6675]">Checkout Web</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
