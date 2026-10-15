import Link from "next/link";

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1B2430]">Test Strategies</h1>
        <button className="bg-[#1F6F8B] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#134F63]">
          New strategy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section outline */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-4">
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

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#C9D0D8] rounded p-4">
            <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Editor — Product context</h3>
            <textarea className="w-full border border-[#C9D0D8] rounded px-3 py-2 text-sm h-64 focus:ring-2 focus:ring-[#1F6F8B] outline-none" placeholder="Describe product and system context…" />
            <div className="mt-3 flex items-center justify-between">
              <button className="text-[#5B6675] hover:text-[#1F6F8B] text-sm underline">Save version</button>
              <button className="bg-[#1F6F8B] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#134F63]">Request review</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-5">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Version history</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-2 font-medium text-[#5B6675]">Version</th>
              <th className="px-4 py-2 font-medium text-[#5B6675]">Author</th>
              <th className="px-4 py-2 font-medium text-[#5B6675]">Date</th>
              <th className="px-4 py-2 font-medium text-[#5B6675] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-2 text-[#1B2430]">v1.0</td>
              <td className="px-4 py-2 text-[#5B6675]">QA Lead</td>
              <td className="px-4 py-2 text-[#5B6675]">Today</td>
              <td className="px-4 py-2 text-right">
                <Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm mr-3">Compare</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-4">
        <div className="flex items-start gap-3">
          <span className="text-[#6B4FA3]">✦</span>
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
