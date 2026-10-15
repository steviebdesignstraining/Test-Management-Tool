import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function TestCasesPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="hidden lg:block w-72 bg-white border border-[#C9D0D8] rounded p-[28px]">
        <h3 className="text-sm font-semibold text-[#1B2430] mb-3">Suites</h3>
        <ul className="space-y-1 text-sm text-[#5B6675]">
          <li className="flex items-center gap-2">
            <span>▾</span>
            <span className="text-[#1B2430] font-medium">Root</span>
          </li>
          <li className="pl-4">
            <span>▸</span>
            <Link href="#" className="text-[#1F6F8B] hover:underline">Authentication</Link>
          </li>
          <li className="pl-4">
            <span>▸</span>
            <Link href="#" className="text-[#1F6F8B] hover:underline">Checkout flow</Link>
          </li>
        </ul>
      </aside>

      <div className="flex-1 space-y-4">
        <PageHeader
          breadcrumb="Test Cases"
          title="Test Cases"
          description="Manage manual and automated test cases."
          actions={
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Filter…" className="input w-40" />
              <button className="btn-primary flex items-center gap-2">
                Import CSV
              </button>
              <button className="btn-link">Export</button>
            </div>
          }
        />

        <div className="bg-white border border-[#C9D0D8] rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7F9]">
              <tr>
                <th className="table-header w-20"><input type="checkbox" /></th>
                <th className="table-header">Key</th>
                <th className="table-header">Title</th>
                <th className="table-header">Type</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Status</th>
                <th className="table-header">Automation</th>
                <th className="table-header">Owner</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D0D8]">
              <tr className="hover:bg-[#EDF0F3]">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3 text-[#1B2430] font-medium"><Link href="/test-cases/TC-001" className="text-[#1F6F8B] hover:underline">TC-001</Link></td>
                <td className="px-4 py-3"><Link href="/test-cases/TC-001" className="text-[#1F6F8B] hover:underline">Login with valid credentials</Link></td>
                <td className="px-4 py-3 text-[#5B6675]">Positive</td>
                <td className="px-4 py-3"><span className="badge status-pass">High</span></td>
                <td className="px-4 py-3"><span className="badge status-neutral">Draft</span></td>
                <td className="px-4 py-3 text-[#5B6675]">Not mapped</td>
                <td className="px-4 py-3 text-[#5B6675]">Alex Rivera</td>
                <td className="px-4 py-3 text-right">
                  <Link href="#" className="btn-link mr-3">Edit</Link>
                  <Link href="#" className="btn-destructive">Delete</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#FAF8FD] border border-dashed border-[#6B4FA3] rounded p-[28px]">
          <div className="flex items-start gap-3">
            <span className="text-[#6B4FA3]">AI</span>
            <div>
              <p className="text-sm font-semibold text-[#1B2430] mb-1">AI duplicate detection</p>
              <p className="text-xs text-[#55398C]">Potential duplicate found: TC-005 "Login with valid credentials" (82% similarity)</p>
              <button className="text-[#55398C] text-xs underline mt-1">Review suggestion</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
