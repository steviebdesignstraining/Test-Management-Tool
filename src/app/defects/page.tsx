import Link from "next/link";

export default function DefectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1B2430]">Defects</h1>
        <button className="bg-[#1F6F8B] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#134F63]">
          Report defect
        </button>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Title</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Severity</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Status</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Assignee</th>
              <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3"><Link href="#" className="text-[#1F6F8B] hover:underline font-medium">Login fails on Safari</Link></td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#FBE7E4] text-[#8F2A20] rounded text-[10px] font-medium">High</span></td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#EDF0F3] text-[#444F5E] rounded text-[10px] font-medium">Open</span></td>
              <td className="px-4 py-3 text-[#5B6675]">Sam Chen</td>
              <td className="px-4 py-3 text-right">
                <Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">TC-001</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-5">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Defect detail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-[#5B6675] uppercase tracking-wider">Expected result</p>
            <p className="text-[#1B2430]">User is logged in and redirected to dashboard.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#5B6675] uppercase tracking-wider">Actual result</p>
            <p className="text-[#1B2430]">Error page displayed: "Invalid credentials" despite correct input.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#5B6675] uppercase tracking-wider">Environment</p>
            <p className="text-[#1B2430]">Safari 17, macOS Sonoma</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#5B6675] uppercase tracking-wider">Build</p>
            <p className="text-[#1B2430]">v2.4.1</p>
          </div>
        </div>
      </div>

      <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-4">
        <div className="flex items-start gap-3">
          <span className="text-[#6B4FA3]">✦</span>
          <div>
            <p className="text-sm font-semibold text-[#1B2430] mb-1">AI root-cause hypothesis</p>
            <p className="text-xs text-[#55398C]">Safari may be storing credentials in a different keychain, causing authentication to fail. Cites: TC-001 execution log.</p>
          </div>
        </div>
      </div>

      <button className="w-full border border-[#C9D0D8] text-[#1F6F8B] py-2 rounded text-sm font-medium hover:bg-[#E4F0F4] flex items-center justify-center gap-2">
        <span className="text-[12px]">↗</span> Create GitHub issue
      </button>
    </div>
  );
}
