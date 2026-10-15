import Link from "next/link";

export default function TestPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1B2430]">Test Plans</h1>
        <button className="bg-[#1F6F8B] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#134F63]">
          New test plan
        </button>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Plan</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Progress</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Scope</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Owner</th>
              <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Actions</th>
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
                <div className="text-[10px] text-[#5B6675] mt-1">70% (14/20)</div>
              </td>
              <td className="px-4 py-3 text-[#5B6675]">Checkout, Payments</td>
              <td className="px-4 py-3 text-[#5B6675]">Sam Chen</td>
              <td className="px-4 py-3 text-right">
                <Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] mr-3 text-sm">Export summary</Link>
                <Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">Snapshot</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-5">
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
