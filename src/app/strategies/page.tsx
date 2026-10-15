import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Test Strategies"
        title="Test Strategies"
        description="Define and approve test strategies per section."
        actions={
          <button className="btn-primary">New strategy</button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Sections</h3>
            <ul className="space-y-2 text-sm text-[#5B6675]">
              <li>Product context</li>
              <li>Quality objectives</li>
              <li>Scope</li>
              <li>Test levels</li>
              <li>Manual vs automation</li>
              <li>Test data</li>
              <li>Coverage</li>
              <li>Accessibility</li>
              <li>Security</li>
              <li>Performance</li>
              <li>CI/CD gates</li>
              <li>Entry/exit criteria</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Editor — Product context</h3>
            <textarea className="input w-full h-64" placeholder="Describe product and system context…" />
            <div className="mt-3 flex items-center justify-between">
              <button className="btn-link text-sm">Save version</button>
              <button className="btn-primary text-xs px-3 py-1.5">Request review</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Version history</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-2">Version</th>
              <th className="table-header px-4 py-2">Author</th>
              <th className="table-header px-4 py-2">Date</th>
              <th className="table-header px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-2 text-[#1B2430]">v1.0</td>
              <td className="px-4 py-2 text-[#5B6675]">QA Lead</td>
              <td className="px-4 py-2 text-[#5B6675]">Today</td>
              <td className="px-4 py-2 text-right">
                <Link href="#" className="btn-link text-sm mr-3">Compare</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-[28px]">
        <div className="flex items-start gap-3">
          <span className="text-[#6B4FA3]">AI</span>
          <div>
            <p className="text-sm font-semibold text-[#1B2430] mb-1">AI review suggestion</p>
            <p className="text-xs text-[#55398C]">Consider adding performance testing criteria for checkout under load.</p>
            <button className="text-[#55398C] text-xs underline mt-1">Apply suggestion</button>
          </div>
        </div>
      </div>
    </div>
  );
}
