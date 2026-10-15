import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function TestPlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Plans"
        title="Test Plans"
        description="Organise test cases into plans and track progress."
        actions={
          <button className="btn-primary">New test plan</button>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header">Plan</th>
              <th className="table-header">Progress</th>
              <th className="table-header">Scope</th>
              <th className="table-header">Owner</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3">
                <div className="text-[#1B2430] font-medium"><Link href="#" className="text-[#1F6F8B] hover:underline">Q4 Regression</Link></div>
                <div className="text-xs text-[#5B6675]">Sprint 14 • Regression cycle</div>
              </td>
              <td className="px-4 py-3">
                <div className="w-full bg-[#EDF0F3] h-2 rounded-full">
                  <div className="bg-[#1F6F8B] h-full rounded-full" style={{ width: "70%" }} />
                </div>
                <div className="text-[10px] text-[#5B6675] mt-1">70% (14/20) <span className="sample-badge">Sample data</span></div>
              </td>
              <td className="px-4 py-3 text-[#5B6675]">Checkout, Payments</td>
              <td className="px-4 py-3 text-[#5B6675]">Sam Chen</td>
              <td className="px-4 py-3 text-right">
                <Link href="#" className="btn-link mr-3">Export summary</Link>
                <Link href="#" className="btn-link">Snapshot</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-4">Plan summary</h3>
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
        </div>
      </div>
    </div>
  );
}
