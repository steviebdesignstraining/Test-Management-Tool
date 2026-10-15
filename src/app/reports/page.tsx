import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1B2430]">Reports / Allure</h1>
        <button className="bg-[#1F6F8B] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#134F63]">
          Link Allure report
        </button>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Report</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Run</th>
              <th className="px-4 py-3 font-medium text-[#5B6675]">Status</th>
              <th className="px-4 py-3 font-medium text-[#5B6675] text-right">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3 text-[#1B2430] font-medium">CI Tests — main #42</td>
              <td className="px-4 py-3 text-[#5B6675]">CI Tests</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#EDF0F3] text-[#444F5E] rounded text-[10px] font-medium">Results missing</span></td>
              <td className="px-4 py-3 text-right"><Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">No artifact</Link></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-5">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Report summary</h3>
        <p className="text-sm text-[#5B6675]">Select a report to see trend, attachments and history.</p>
      </div>
    </div>
  );
}
