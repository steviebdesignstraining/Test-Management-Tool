import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Reports / Allure"
        title="Reports / Allure"
        description="View and link Allure test reports."
        actions={
          <button className="btn-primary">Link Allure report</button>
        }
      />

      <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F7F9]">
            <tr>
              <th className="table-header px-4 py-3">Report</th>
              <th className="table-header px-4 py-3">Run</th>
              <th className="table-header px-4 py-3">Status</th>
              <th className="table-header px-4 py-3 text-right">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9D0D8]">
            <tr className="hover:bg-[#EDF0F3]">
              <td className="px-4 py-3 text-[#1B2430] font-medium">CI Tests — main #42</td>
              <td className="px-4 py-3 text-[#5B6675]">CI Tests</td>
              <td className="px-4 py-3"><span className="badge status-neutral">Results missing</span></td>
              <td className="px-4 py-3 text-right"><Link href="#" className="text-[#5B6675] hover:text-[#1F6F8B] text-sm">No artifact</Link></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Report summary</h3>
        <p className="text-sm text-[#5B6675]">Select a report to see trend, attachments and history.</p>
      </div>
    </div>
  );
}
