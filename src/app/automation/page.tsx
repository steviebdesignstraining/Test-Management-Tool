import Link from "next/link";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1B2430]">Automation</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#C9D0D8]">
        <button className="px-4 py-3 border-b-2 border-[#1F6F8B] text-[#1F6F8B] text-sm font-medium">Repositories</button>
        <button className="px-4 py-3 border-b-2 border-transparent text-[#5B6675] text-sm font-medium hover:text-[#1B2430]">Scripts</button>
        <button className="px-4 py-3 border-b-2 border-transparent text-[#5B6675] text-sm font-medium hover:text-[#1B2430]">Mappings</button>
      </div>

      {/* Coverage KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapped</p>
          <p className="text-2xl font-semibold text-[#1B2430]">14</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Manual only</p>
          <p className="text-2xl font-semibold text-[#1B2430]">28</p>
        </div>
        <div className="bg-white border border-[#C9D0D8] rounded p-4">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Scripts without case</p>
          <p className="text-2xl font-semibold text-[#1B2430]">6</p>
        </div>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Test case</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Script</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Confidence</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Source</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Verified</th>
              <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr>
              <td className="px-4 py-3 text-[#1B2430] font-medium">TC-001</td>
              <td className="px-4 py-3 text-[#5B6675]">login_test.py</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#E3F2EA] text-[#14633E] rounded text-[10px] font-medium">95%</span></td>
              <td className="px-4 py-3 text-[#5B6675]">Approved mapping</td>
              <td className="px-4 py-3 text-[#5B6675]">2h ago</td>
              <td className="px-4 py-3 text-right">
                <Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">Change</Link>
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
